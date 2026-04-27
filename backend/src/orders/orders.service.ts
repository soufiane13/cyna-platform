import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { createClient } from '@supabase/supabase-js';
import PDFDocument from 'pdfkit';
import Stripe from 'stripe';

@Injectable()
export class OrdersService {
  private supabase;
  private stripe: Stripe;

  constructor() {
    const sbUrl = process.env.SUPABASE_URL;
    const sbKey = process.env.SUPABASE_KEY;
    const stripeKey = process.env.STRIPE_SECRET_KEY;

    if (!sbUrl || !sbKey) {
      throw new Error('⚠️ Il manque SUPABASE_URL ou SUPABASE_KEY dans le fichier .env !');
    }

    if (!stripeKey || stripeKey.trim() === '') {
      throw new Error('⚠️ Il manque STRIPE_SECRET_KEY dans le fichier .env ! Allez sur le dashboard Stripe pour la récupérer.');
    }

    this.supabase = createClient(sbUrl, sbKey);

    this.stripe = new Stripe(stripeKey, {
      apiVersion: '2026-03-25.dahlia' as any, // Version requise par votre SDK local
    });
  }

  async create(createOrderDto: any) {
    const { userId, cart, total } = createOrderDto;

    // 1. CRÉER LA COMMANDE (Table 'orders')
    const { data: order, error: orderError } = await this.supabase
      .from('orders') // <--- Nom anglais
      .insert([
        {
          user_id: userId, // Attention: Supabase Auth utilise des UUID
          total_amount: total,
          status: 'pending',
          billing_address_snapshot: 'Adresse par défaut',
        },
      ])
      .select()
      .single();

    if (orderError) {
      console.error(orderError);
      throw new HttpException("Erreur création commande : " + orderError.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    const orderId = order.id;

    // 2. PRÉPARER LES ITEMS (Table 'order_items')
    const orderItems = cart.map((item) => ({
      order_id: orderId,
      product_id: item.id,
      quantity: item.quantity,
      price_at_purchase: item.price, // On fige le prix
      selected_plan: item.duration || 'monthly', // On enregistre le plan choisi (par défaut mensuel)
    }));

    // 3. INSÉRER LES ITEMS
    const { error: itemsError } = await this.supabase
      .from('order_items') // <--- Nom anglais
      .insert(orderItems);

    if (itemsError) {
      console.error(itemsError);
      throw new HttpException("Erreur ajout produits : " + itemsError.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    // 4. METTRE À JOUR LE STOCK (Table 'products')
    for (const item of cart) {
      const { data: product } = await this.supabase
        .from('products') // <--- Nom anglais (vu sur ta capture)
        .select('stock_virtuel')
        .eq('id', item.id)
        .single();
      
      if (product) {
        await this.supabase
          .from('products')
          .update({ stock_virtuel: product.stock_virtuel - item.quantity })
          .eq('id', item.id);
      }
    }

    // 5. CRÉER LA SESSION DE PAIEMENT STRIPE
    const lineItems = cart.map((item) => ({
      price_data: {
        currency: 'eur',
        product_data: {
          name: item.name || 'Produit Cyber', // Ajustez selon les données du cart
        },
        unit_amount: Math.round(item.price * 1.20 * 100), // Prix TTC pour Stripe (TVA 20%)
      },
      quantity: item.quantity,
    }));

    let checkoutUrl: string | null = null;
    // On sécurise l'URL du frontend avec un fallback local
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

    try {
      const session = await this.stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        mode: 'payment',
        line_items: lineItems,
        success_url: `${frontendUrl}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${frontendUrl}/cart?canceled=true`,
        client_reference_id: orderId, // Pour lier le paiement à la commande
      });
      checkoutUrl = session.url;
    } catch (err) {
      console.error('Erreur Stripe:', err);
      throw new HttpException('Erreur lors de l\'initialisation du paiement', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    return { 
      message: 'Commande créée, en attente de paiement !', 
      orderId: orderId, 
      status: 'PENDING_PAYMENT',
      checkoutUrl: checkoutUrl // L'URL que le frontend va utiliser pour rediriger le client
    };
  }


  async findAllByUser(userId: string) {
    const { data, error } = await this.supabase
      .from('orders')
      .select(`
        *,
        order_items (
          *,
          products (*)
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false }); // Les plus récentes en premier

    if (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
    return data;
  }


  // 👇 NOUVELLE MÉTHODE : GÉNÉRER LE PDF
  async generateInvoice(orderId: string): Promise<Buffer> {
    // 1. Récupérer les données complètes de la commande
    const { data: order, error } = await this.supabase
      .from('orders')
      .select(`
        *,
        order_items (
          *,
          products (*)
        )
      `)
      .eq('id', orderId)
      .single();

    if (error || !order) {
      throw new HttpException('Commande introuvable', HttpStatus.NOT_FOUND);
    }

    // Bloquer le téléchargement si la commande n'est pas payée/validée
    if (order.status !== 'paid' && order.status !== 'completed') {
      throw new HttpException('La facture n\'est pas encore disponible. Le paiement doit être validé.', HttpStatus.FORBIDDEN);
    }

    // 1.5. Récupérer le nom et l'email de l'utilisateur depuis Supabase
    let clientName = 'Client';
    let clientEmail = '';
    if (order.user_id) {
      const { data: userData } = await this.supabase.auth.admin.getUserById(order.user_id);
      if (userData && userData.user) {
        clientEmail = userData.user.email || '';
        clientName = userData.user.user_metadata?.full_name || userData.user.user_metadata?.company || 'Client';
      }
    }

    // 2. Créer un document PDF en mémoire
    const doc = new PDFDocument({ margin: 50 });
    const buffers = [];

    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => {});

    // --- DESSIN DU PDF ---

    // HEADER
    doc.fontSize(20).text('CYNA DEFENSE', { align: 'center' });
    doc.fontSize(10).text('Sécurité Offensive & Infrastructure', { align: 'center' });
    doc.moveDown();
    doc.text('------------------------------------------------------', { align: 'center' });
    doc.moveDown();

    // INFO CLIENT & COMMANDE
    doc.fontSize(12).text(`FACTURE N° ${order.id}`);
    doc.text(`Date : ${new Date(order.created_at).toLocaleDateString()}`);
    doc.text(`Client : ${clientName}`);
    if (clientEmail) doc.text(`Email : ${clientEmail}`);
    doc.moveDown();

    // TABLEAU DES PRODUITS
    const tableTop = 250;
    doc.font('Helvetica-Bold');
    doc.text('Produit', 50, tableTop);
    doc.text('Quantité', 300, tableTop);
    doc.text('Prix Unit.', 400, tableTop);
    doc.text('Total', 500, tableTop);
    doc.font('Helvetica');

    let y = tableTop + 25;
    
    order.order_items.forEach((item) => {
      const productName = item.products?.name || 'Produit Inconnu';
      const lineTotal = item.quantity * item.price_at_purchase;

      doc.text(productName, 50, y);
      doc.text(item.quantity.toString(), 300, y);
      doc.text(`${item.price_at_purchase} €`, 400, y);
      doc.text(`${lineTotal.toFixed(2)} €`, 500, y);
      y += 20;
    });

    // TOTAL
    const totalHT = Number(order.total_amount || order.total);
    const montantTVA = totalHT * 0.20; // 20% de TVA
    const totalTTC = totalHT + montantTVA;

    doc.moveDown();
    doc.text('------------------------------------------------------', 50, y + 20);
    doc.fontSize(12).text(`Total HT : ${totalHT.toFixed(2)} €`, 350, y + 40, { align: 'right' });
    doc.text(`TVA (20%) : ${montantTVA.toFixed(2)} €`, 350, y + 60, { align: 'right' });
    doc.fontSize(14).text(`TOTAL TTC À PAYER : ${totalTTC.toFixed(2)} €`, 350, y + 85, { align: 'right' });

    // FIN
    doc.end();

    // 3. Retourner le Buffer (le fichier binaire)
    return new Promise((resolve) => {
      doc.on('end', () => {
        const pdfData = Buffer.concat(buffers);
        resolve(pdfData);
      });
    });
  }


  // 👇 1. RÉCUPÉRER TOUTES LES COMMANDES (ADMIN)
  async findAll() {
    const { data, error } = await this.supabase
      .from('orders')
      .select(`
        *,
        order_items (
          *,
          products (*)
        )
      `)
      .order('created_at', { ascending: false }); // Les plus récentes en haut

    if (error) throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    return data;
  }

  // 👇 2. METTRE À JOUR LE STATUT (ADMIN)
  async updateStatus(id: string, status: string) {
    const { data, error } = await this.supabase
      .from('orders')
      .update({ status }) // On modifie juste la colonne 'status'
      .eq('id', id)
      .select();

    if (error) throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    return data;
  }



}