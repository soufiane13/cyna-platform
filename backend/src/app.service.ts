import { Injectable } from '@nestjs/common';
import { createClient } from '@supabase/supabase-js';

@Injectable()
export class AppService {
  private supabase;

  constructor() {
    const sbUrl = process.env.SUPABASE_URL;
    const sbKey = process.env.SUPABASE_KEY;

    if (!sbUrl || !sbKey) {
      throw new Error('⚠️ [AppService] Il manque SUPABASE_URL ou SUPABASE_KEY dans le fichier .env !');
    }
    this.supabase = createClient(sbUrl, sbKey);
  }

  getHello(): string {
    return 'Hello World!';
  }

  // --- VÉRIFICATION DE LA CONNEXION (Health Check) ---
  async checkDbConnection() {
    try {
      // On tente une lecture très simple pour vérifier la connexion ET les droits
      const { data, error } = await this.supabase.from('products').select('id').limit(1);
      
      if (error) throw error;
      return { status: 'success', message: 'Connexion à Supabase OK !', rls_warning: data.length === 0 ? '⚠️ La table semble vide OU bloquée par le RLS (Row Level Security).' : 'Données lues avec succès.' };
    } catch (error: any) {
      return { status: 'error', message: 'Erreur de connexion à Supabase', details: error.message };
    }
  }

  // --- PARTIE PRODUITS (On garde ça !) ---
  async getProducts() {
    const { data, error } = await this.supabase.from('products').select('*');
    if (error) console.error(error);
    return data || [];
  }

  // --- PARTIE ALERTE (Nouveau !) ---
  async getAlert() {
    const { data } = await this.supabase
      .from('site_settings')
      .select('value')
      .eq('key', 'home_alert')
      .single();
    return { message: data?.value || '' };
  }

  async updateAlert(newMessage: string) {
    const { data } = await this.supabase
      .from('site_settings')
      .upsert({ key: 'home_alert', value: newMessage })
      .select();
    return data;
  }

  // --- PARTIE CARROUSEL (Nouveau !) ---
  async getCarousel() {
    const { data } = await this.supabase
      .from('site_settings')
      .select('value')
      .eq('key', 'home_carousel')
      .single();
      
    try {
      return { items: data?.value ? JSON.parse(data.value) : [] };
    } catch (e) {
      return { items: [] }; // En cas d'erreur de format JSON, on renvoie un tableau vide
    }
  }

  async updateCarousel(items: any[]) {
    const { data } = await this.supabase
      .from('site_settings')
      .upsert({ key: 'home_carousel', value: JSON.stringify(items) })
      .select();
    return data;
  }

  // --- PARTIE HERO BACKGROUND (Nouveau !) ---
  async getHeroBg() {
    const { data } = await this.supabase
      .from('site_settings')
      .select('value')
      .eq('key', 'hero_bg')
      .single();
    return { image_url: data?.value || '' };
  }

  async updateHeroBg(imageUrl: string) {
    const { data } = await this.supabase
      .from('site_settings')
      .upsert({ key: 'hero_bg', value: imageUrl })
      .select();
    return data;
  }

  // --- PARTIE TOP PRODUITS (Nouveau !) ---
  async getTopProducts() {
    // 1. Exécuter les requêtes lourdes EN PARALLÈLE pour diviser le temps par deux
    const [ordersRes, settingRes] = await Promise.all([
      this.supabase
        .from('orders')
        .select('order_items (*, products (*))')
        .in('status', ['paid', 'completed']),
      this.supabase
        .from('site_settings')
        .select('value')
        .eq('key', 'top_products_order')
        .single()
    ]);

    if (ordersRes.error) {
      console.error("Erreur récupération commandes pour Top Produits:", ordersRes.error);
      return [];
    }

    const orders = ordersRes.data || [];
    const setting = settingRes.data;

    // 2. Calculer les revenus par produit
    const productSales: Record<string, { name: string; category: string; count: number; revenue: number }> = {};
    orders.forEach(order => {
      (order.order_items || []).forEach(item => {
        if (item.products) {
          const pName = item.products.name || item.products.nom || 'Service Inconnu';
          if (!productSales[pName]) productSales[pName] = { name: pName, category: item.products.category || 'N/A', count: 0, revenue: 0 };
          productSales[pName].count += item.quantity;
          productSales[pName].revenue += (item.quantity * Number(item.price_at_purchase || 0));
        }
      });
    });

    // 3. Récupérer tous les produits vendus
    let topList = Object.values(productSales);

    // 3. Appliquer le tri (Personnalisé, sinon par revenu décroissant)
    if (setting?.value) {
      try {
        const customOrder: string[] = JSON.parse(setting.value);
        topList.sort((a, b) => {
          const idxA = customOrder.indexOf(a.name);
          const idxB = customOrder.indexOf(b.name);
          if (idxA === -1 && idxB === -1) return b.revenue - a.revenue;
          if (idxA === -1) return 1;
          if (idxB === -1) return -1;
          return idxA - idxB;
        });
      } catch (e) {
        topList.sort((a, b) => b.revenue - a.revenue);
      }
    } else {
      topList.sort((a, b) => b.revenue - a.revenue);
    }

    return topList.slice(0, 5);
  }

  async updateTopProductsOrder(order: string[]) {
    const { data } = await this.supabase
      .from('site_settings')
      .upsert({ key: 'top_products_order', value: JSON.stringify(order) })
      .select();
    return data;
  }
}