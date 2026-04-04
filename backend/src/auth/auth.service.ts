import { Injectable, UnauthorizedException, HttpException, HttpStatus } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class AuthService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_KEY!
    );
  }

  // Fonction pour connecter un utilisateur
  async login(body: any) {
    const { email, password } = body;

    // 1. On demande à Supabase si l'email/password est bon
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw new UnauthorizedException('Email ou mot de passe incorrect');
    }

    // 2. Vérifier si l'utilisateur a le rôle 'admin' dans ses métadonnées
    const isAdmin = data.user.user_metadata?.role === 'admin';

    // 3. Logique 2FA (MFA) obligatoire pour l'administrateur
    if (isAdmin) {
      const factors = data.user.factors || [];
      const totpFactor = factors.find(f => f.factor_type === 'totp' && f.status === 'verified');

      if (totpFactor) {
        // L'admin a déjà configuré la 2FA, on doit la vérifier
        return {
          message: 'Authentification 2FA requise',
          mfaRequired: true,
          factorId: totpFactor.id,
          token: data.session.access_token, // Token temporaire (Niveau AAL1)
          isAdmin,
        };
      } else {
        // L'admin n'a pas encore configuré la 2FA, il doit le faire
        return {
          message: 'Configuration 2FA requise pour les administrateurs',
          mfaSetupRequired: true,
          token: data.session.access_token, // Token temporaire (Niveau AAL1)
          isAdmin,
        };
      }
    }

    // 4. Si c'est un utilisateur classique, on le laisse passer
    return {
      message: 'Connexion réussie',
      user: data.user,
      token: data.session.access_token, // Le sésame pour accéder au compte
      isAdmin: isAdmin, // On informe le frontend que c'est un admin
    };
  }

  // Fonction pour inscrire un nouvel utilisateur
  async register(body: any) {
    const { email, password, fullName } = body;

    const { data, error } = await this.supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName }, // On stocke le nom complet
      },
    });

    if (error) {
      return { error: error.message };
    }

    return { message: 'Inscription réussie ! Vérifiez vos emails.', user: data.user };
  }

  
  async resetPassword(body: any) {
    const { email } = body;
    
    const { error } = await this.supabase.auth.resetPasswordForEmail(email);

    if (error) {
      throw new UnauthorizedException("Erreur : " + error.message);
    }

    return { message: 'Email de réinitialisation envoyé ! Vérifiez votre boîte de réception.' };
  }

  async updatePassword(body: any, accessToken: string) {
    const { newPassword } = body;

    const userClient = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_KEY!,
      { global: { headers: { Authorization: `Bearer ${accessToken}` } } }
    );

    const { data, error } = await userClient.auth.updateUser({ password: newPassword });

    if (error) {
      throw new UnauthorizedException('La mise à jour du mot de passe a échoué : ' + error.message);
    }

    return { message: 'Mot de passe mis à jour avec succès.', user: data.user };
  }

  // ==========================================
  // GESTION DE LA 2FA (ADMIN)
  // ==========================================

  // Générer le QR Code pour configurer la 2FA (TOTP)
  async setup2FA(accessToken: string) {
    const userClient = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_KEY!,
      { global: { headers: { Authorization: `Bearer ${accessToken}` } } }
    );

    // 1. NETTOYAGE : Supprimer les anciens QR Codes non vérifiés pour éviter les conflits
    const factors = await userClient.auth.mfa.listFactors();
    if (factors.data && factors.data.totp) {
      for (const factor of factors.data.totp) {
        if ((factor.status as string) === 'unverified') {
          await userClient.auth.mfa.unenroll({ factorId: factor.id });
        }
      }
    }

    // 2. Générer un QR Code tout neuf et propre
    const { data, error } = await userClient.auth.mfa.enroll({ factorType: 'totp' });

    if (error) {
      throw new UnauthorizedException('Erreur lors de la configuration 2FA : ' + error.message);
    }

    return {
      factorId: data.id,
      qrCode: data.totp.qr_code, // Image SVG (code source) pour afficher le QR code sur React
      secret: data.totp.secret,  // Clé secrète pour une saisie manuelle
    };
  }

  // Vérifier le code 2FA (TOTP) entré par l'utilisateur
  async verify2FA(body: any, accessToken: string) {
    const { factorId, code } = body;
    const userClient = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_KEY!,
      { global: { headers: { Authorization: `Bearer ${accessToken}` } } }
    );

    // 1. Créer un "challenge" de vérification auprès de Supabase
    const challenge = await userClient.auth.mfa.challenge({ factorId });
    if (challenge.error) {
      console.error("❌ ERREUR CHALLENGE 2FA :", challenge.error);
      throw new UnauthorizedException(challenge.error.message);
    }

    // 2. Vérifier le code saisi (ex: via Google Authenticator)
    const verify = await userClient.auth.mfa.verify({
      factorId,
      challengeId: challenge.data.id,
      code,
    });

    if (verify.error) {
      console.error("❌ ERREUR VERIFY 2FA :", verify.error);
      throw new UnauthorizedException('Code 2FA invalide : ' + verify.error.message);
    }

    // Récupérer la session mise à jour (Sécurité élevée : AAL2)
    const { data: { session } } = await userClient.auth.getSession();

    return {
      message: '2FA validée avec succès !',
      token: session?.access_token || accessToken,
      user: verify.data.user,
      isAdmin: true,
    };
  }

  // ==========================================
  // GESTION DES UTILISATEURS (ADMIN)
  // ==========================================
  async getAllUsers() {
    // Remarque : Cette action nécessite que votre SUPABASE_KEY soit la clé "Service Role"
    const { data, error } = await this.supabase.auth.admin.listUsers();
    if (error) {
      throw new HttpException('Erreur lors de la récupération des utilisateurs : ' + error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
    return data.users;
  }

  // ==========================================
  // MISE À JOUR DU PROFIL (UTILISATEUR & ADMIN)
  // ==========================================
  async updateProfile(userId: string, body: any) {
    const { fullName, phone, address, company } = body;
    
    // On utilise l'API admin de Supabase pour mettre à jour les métadonnées
    const { data, error } = await this.supabase.auth.admin.updateUserById(userId, {
      user_metadata: {
        full_name: fullName,
        phone,
        address,
        company
      }
    });

    if (error) {
      console.error("❌ ERREUR SUPABASE (Mise à jour Profil) :", error);
      throw new HttpException('Erreur lors de la mise à jour du profil : ' + error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    return data.user;
  }
}