import {
  Injectable,
  UnauthorizedException,
  HttpException,
  HttpStatus,
  ForbiddenException,
} from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class AuthService {
  private supabase: SupabaseClient;       // clé anon  → auth utilisateur
  private supabaseAdmin: SupabaseClient;  // clé service_role → actions admin

  constructor() {
    this.supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_KEY!,
    );
    this.supabaseAdmin = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } },
    );
  }

  // ─── AUTH ────────────────────────────────────────────────────────────────

  async login(body: any) {
    const { data, error } = await this.supabase.auth.signInWithPassword(body);
    if (error) throw new UnauthorizedException('Email ou mot de passe incorrect');

    const isAdmin = data.user.user_metadata?.role === 'admin';
    const token = data.session.access_token;

    if (isAdmin) {
      const totp = (data.user.factors || []).find(
        f => f.factor_type === 'totp' && f.status === 'verified'
      );
      return totp
        ? { message: 'Authentification 2FA requise', mfaRequired: true, factorId: totp.id, token, isAdmin }
        : { message: 'Configuration 2FA requise', mfaSetupRequired: true, token, isAdmin };
    }

    return { message: 'Connexion réussie', user: data.user, token, isAdmin };
  }

  async register(body: any) {
    const { data, error } = await this.supabase.auth.signUp({
      email: body.email,
      password: body.password,
      options: { data: { full_name: body.fullName } },
    });
    return error
      ? { error: error.message }
      : { message: 'Inscription réussie ! Vérifiez vos emails.', user: data.user };
  }

  async resetPassword({ email }: any) {
    const { error } = await this.supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/update-password`,
    });
    if (error) throw new UnauthorizedException(error.message);
    return { message: 'Email de réinitialisation envoyé !' };
  }

  async updatePassword({ newPassword }: any, accessToken: string) {
    const { data: { user }, error: userError } = await this.supabase.auth.getUser(accessToken);
    if (userError || !user) throw new UnauthorizedException('Lien invalide ou expiré.');

    const { data, error } = await this.supabaseAdmin.auth.admin.updateUserById(
      user.id, { password: newPassword }
    );
    if (error) throw new UnauthorizedException('Échec de la mise à jour : ' + error.message);
    return { message: 'Mot de passe mis à jour.', user: data.user };
  }

  // ─── 2FA ─────────────────────────────────────────────────────────────────

  private userClient(accessToken: string): SupabaseClient {
    return createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_KEY!, {
      global: { headers: { Authorization: `Bearer ${accessToken}` } },
    });
  }

  async setup2FA(accessToken: string) {
    const client = this.userClient(accessToken);
    const { data: factors } = await client.auth.mfa.listFactors();

    for (const f of factors?.totp ?? [])
      if ((f.status as string) === 'unverified')
        await client.auth.mfa.unenroll({ factorId: f.id });

    const { data, error } = await client.auth.mfa.enroll({ factorType: 'totp' });
    if (error) throw new UnauthorizedException('Erreur 2FA : ' + error.message);

    return { factorId: data.id, qrCode: data.totp.qr_code, secret: data.totp.secret };
  }

  async verify2FA({ factorId, code }: any, accessToken: string) {
    const client = this.userClient(accessToken);
    const challenge = await client.auth.mfa.challenge({ factorId });
    if (challenge.error) throw new UnauthorizedException(challenge.error.message);

    const verify = await client.auth.mfa.verify({
      factorId, challengeId: challenge.data.id, code,
    });
    if (verify.error) throw new UnauthorizedException('Code 2FA invalide : ' + verify.error.message);

    const { data: { session } } = await client.auth.getSession();
    return {
      message: '2FA validée !',
      token: session?.access_token || accessToken,
      user: verify.data.user,
      isAdmin: true,
    };
  }

  // ─── USERS (ADMIN) ────────────────────────────────────────────────────────

  async getAllUsers() {
    const { data, error } = await this.supabaseAdmin.auth.admin.listUsers();
    if (error) throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    return data.users;
  }

  async deleteUser(userId: string) {
    const { data: active, error: checkError } = await this.supabaseAdmin
      .from('orders')
      .select('id')
      .eq('user_id', userId)
      .in('status', ['paid', 'completed'])
      .limit(1);

    if (checkError) throw new HttpException(checkError.message, HttpStatus.INTERNAL_SERVER_ERROR);
    if (active?.length) throw new ForbiddenException('Impossible : abonnement actif en cours.');

    const { error } = await this.supabaseAdmin.auth.admin.deleteUser(userId);
    if (error) throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    return { message: 'Utilisateur supprimé avec succès.' };
  }

  async updateProfile(userId: string, body: any) {
    const payload: any = {
      user_metadata: {
        full_name: body.fullName,
        phone: body.phone,
        address: body.address,
        company: body.company,
      },
    };
    if (body.password?.trim()) payload.password = body.password;

    const { data, error } = await this.supabaseAdmin.auth.admin.updateUserById(userId, payload);
    if (error) throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    return data.user;
  }
}