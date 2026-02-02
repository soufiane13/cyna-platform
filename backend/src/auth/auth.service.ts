import { Injectable, UnauthorizedException } from '@nestjs/common';
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

    // 2. Si c'est bon, on renvoie les infos de l'utilisateur
    return {
      message: 'Connexion réussie',
      user: data.user,
      token: data.session.access_token, // Le sésame pour accéder au compte
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
}