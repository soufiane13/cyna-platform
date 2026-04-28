import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MessagesService {
  private supabase: SupabaseClient;

  constructor() {
    const sbUrl = process.env.SUPABASE_URL;
    const sbKey = process.env.SUPABASE_KEY;

    if (!sbUrl || !sbKey) {
      throw new Error('⚠️ Il manque SUPABASE_URL ou SUPABASE_KEY dans le fichier .env !');
    }

    this.supabase = createClient(sbUrl, sbKey);
  }

  // 1. Recevoir un message depuis le chatbot
  async createMessage(body: any) {
    const { userName, contactInfo, message } = body;

    const { data, error } = await this.supabase
      .from('chatbot_messages')
      .insert([{ user_name: userName, contact_info: contactInfo, message, status: 'unread' }])
      .select()
      .single();

    if (error) throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);

    // --- NOUVEAU : Envoi d'une alerte e-mail à l'administrateur ---
    try {
      const adminEmail = process.env.SMTP_USER?.trim();
      if (adminEmail) {
        await this.sendEmail({
          to: adminEmail,
          subject: `🚨 Nouveau Ticket Support : ${contactInfo}`,
          message: `Un utilisateur a demandé à contacter un administrateur via Nexus.\n\nCoordonnées du client : ${contactInfo}\n\nDemande détaillée :\n${message}\n\nRendez-vous dans votre Espace Admin (Onglet "Support & Chat") pour lui répondre en un clic !`
        });
      }
    } catch (emailError) {
      console.error("L'alerte e-mail admin a échoué (mais le ticket est bien sauvegardé):", emailError);
    }

    return { success: true, message: 'Message envoyé au support avec succès !', data };
  }

  // 2. Récupérer tous les messages pour le backoffice admin
  async findAll() {
    const { data, error } = await this.supabase
      .from('chatbot_messages')
      .select('*')
      .order('created_at', { ascending: false }); // Les plus récents en premier

    if (error) throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    return data;
  }

  // 3. Mettre à jour le statut du message (ex: marquer comme 'replied')
  async updateStatus(id: string, status: string) {
    const { data, error } = await this.supabase
      .from('chatbot_messages')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error("❌ ERREUR SUPABASE (Sauvegarde Message) :", error);
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
    return data;
  }

  // 4. Envoyer un email (personnel ou collectif)
  async sendEmail(body: { to: string | string[]; subject: string; message: string }) {
    const { to, subject, message } = body;

    // On force la suppression des espaces ou sauts de ligne invisibles (fréquent sur Windows)
    const smtpUser = process.env.SMTP_USER?.trim();
    const smtpPass = process.env.SMTP_PASS?.trim();

    console.log('\n--- 🔍 DEBUG NODEMAILER ---');
    console.log('Email utilisé :', smtpUser);
    console.log('Taille du mot de passe :', smtpPass ? smtpPass.length + ' caractères' : 'VIDE OU INTROUVABLE');
    console.log('---------------------------\n');

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com', // Serveur SMTP par défaut
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false, // true pour le port 465, false pour 587
      auth: {
        user: smtpUser, // L'adresse email expéditrice nettoyée
        pass: smtpPass, // Le mot de passe nettoyé
      },
      tls: {
        rejectUnauthorized: false, // Permet de contourner les antivirus / proxys locaux
      },
    });

    const mailOptions = {
      from: smtpUser || '"Support CYNA" <support@cyna.com>',
      to: Array.isArray(to) ? to.join(',') : to, // Si c'est un tableau d'emails, on le transforme en liste
      subject: subject,
      text: message,
    };

    try {
      await transporter.sendMail(mailOptions);
      return { success: true, message: 'Email envoyé avec succès !' };
    } catch (error: any) {
      console.error('\n❌ ERREUR NODEMAILER:', error);
      throw new HttpException('Erreur lors de l\'envoi de l\'email: ' + error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}