import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class ProductsService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(
      process.env.SUPABASE_URL || '',
      process.env.SUPABASE_KEY || ''
    );
  }

  async findAll() {
    const { data, error } = await this.supabase.from('products').select('*');
    if (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
    return data;
  }

  // --- AJOUTER UN PRODUIT ---
  async create(data: any) {
    const { error } = await this.supabase
      .from('products')
      .insert([data]);

    if (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
    return { message: 'Produit créé avec succès' };
  }

  // --- AJOUTER PLUSIEURS PRODUITS (EXCEL/CSV) ---
  async createBulk(data: any[]) {
    const { error } = await this.supabase
      .from('products')
      .insert(data); // Supabase accepte nativement les tableaux !

    if (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
    return { message: `${data.length} produits ajoutés avec succès` };
  }

  // --- MODIFIER UN PRODUIT ---
  async update(id: string, data: any) {
    const { error } = await this.supabase
      .from('products')
      .update(data)
      .eq('id', id);

    if (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
    return { message: 'Produit mis à jour avec succès' };
  }

  // --- SUPPRIMER UN PRODUIT ---
  async remove(id: string) {
    const { error } = await this.supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
    return { message: 'Produit supprimé avec succès' };
  }
}
