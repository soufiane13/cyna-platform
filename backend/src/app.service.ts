import { Injectable } from '@nestjs/common';
import { createClient } from '@supabase/supabase-js';

@Injectable()
export class AppService {
  private supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_KEY!);

  getHello(): string {
    return 'Hello World!';
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
}