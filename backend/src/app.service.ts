import { Injectable } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class AppService {
  private supabase: SupabaseClient;

  constructor() {
    // Les "!" sont obligatoires pour éviter l'erreur "string | undefined"
    this.supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_KEY!
    );
  }

  async getHello(): Promise<any> {
    const { data, error } = await this.supabase.from('products').select('*');
    if (error) {
        console.log(error); // Pour voir l'erreur dans le terminal si besoin
        return [];
    }
    return data || [];
  }
}