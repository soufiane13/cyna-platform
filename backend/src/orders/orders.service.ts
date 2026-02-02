import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { createClient } from '@supabase/supabase-js';
import PDFDocument from 'pdfkit';

@Injectable()
export class OrdersService {
  private supabase;

  constructor() {
    const sbUrl = process.env.SUPABASE_URL;
    const sbKey = process.env.SUPABASE_KEY;

    if (!sbUrl || !sbKey) {
      throw new Error('⚠️ Il manque SUPABASE_URL ou SUPABASE_KEY dans le fichier .env !');
    }

    this.supabase = createClient(sbUrl, sbKey);
  }

  async create(createOrderDto: any) {
    const { userId, cart, total } = createOrderDto;

    // 1. CRÉER LA COMMANDE (Table 'orders')
    const { data: order, error: orderError } = await this.supabase
      .from('orders') // <--- Nom anglais
      .insert([
        {
          user_id: userId, // Attention: Supabase Auth utilise des UUID
          total: total,
          status: 'pending',
          billing_snapshot: 'Adresse par défaut',
        },
      ])
      .select()
      .single();

    if (orderError) {
      console.error(orderError);
      throw new HttpException("Erreur création commande", HttpStatus.INTERNAL_SERVER_ERROR);
    }

    const orderId = order.id;

    // 2. PRÉPARER LES ITEMS (Table 'order_items')
    const orderItems = cart.map((item) => ({
      order_id: orderId,
      product_id: item.id,
      quantity: item.quantity,
      price_at_purchase: item.price, // On fige le prix
    }));

    // 3. INSÉRER LES ITEMS
    const { error: itemsError } = await this.supabase
      .from('order_items') // <--- Nom anglais
      .insert(orderItems);

    if (itemsError) {
      console.error(itemsError);
      throw new HttpException("Erreur ajout produits", HttpStatus.INTERNAL_SERVER_ERROR);
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

    return { 
      message: 'Commande validée !', 
      orderId: orderId, 
      status: 'SUCCESS' 
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
    doc.text(`Client ID : ${order.user_id}`); // Idéalement, on mettrait le nom/email ici
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
    doc.moveDown();
    doc.text('------------------------------------------------------', 50, y + 20);
    doc.fontSize(14).text(`TOTAL À PAYER : ${Number(order.total).toFixed(2)} €`, 350, y + 40, { align: 'right' });

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