import { Controller, Get, Post, Delete, Param, Body, Res, HttpStatus, HttpException } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Response } from 'express';

@Controller('coupons')
export class CouponsController {
  private supabase: SupabaseClient = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_KEY!);

  @Get()
  async getAll() {
    const { data } = await this.supabase.from('coupons').select('*').order('created_at', { ascending: false });
    return data || [];
  }

  @Get('validate/:code')
  async validate(@Param('code') code: string, @Res() res: Response) {
    const { data } = await this.supabase.from('coupons').select('*').eq('code', code.toUpperCase()).single();
    if (data && data.is_active) {
      return res.status(HttpStatus.OK).json({ valid: true, code: data.code, discount_percentage: data.discount_percentage });
    }
    return res.status(HttpStatus.OK).json({ valid: false, message: 'Code invalide ou expiré.' });
  }

  @Post()
  async create(@Body() body: any) {
    const { data, error } = await this.supabase.from('coupons').insert([{ code: body.code, discount_percentage: body.discount_percentage }]).select().single();
    if (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
    return data;
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    await this.supabase.from('coupons').delete().eq('id', id);
    return { success: true };
  }
}