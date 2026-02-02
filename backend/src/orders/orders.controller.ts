// 1. Ajoute 'Patch' dans les imports ici 👇
import { Controller, Post, Get, Patch, Body, Param, Res } from '@nestjs/common';
import type { Response } from 'express';
import { OrdersService } from './orders.service';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  // --- 1. CRÉATION (Public) ---
  @Post()
  create(@Body() createOrderDto: any) {
    return this.ordersService.create(createOrderDto);
  }

  // --- 2. ADMIN : VOIR TOUT (GET /orders) ---
  // Important : Cette route doit être distincte pour lister tout
  @Get()
  findAll() {
    return this.ordersService.findAll();
  }

  // --- 3. FACTURE PDF (GET /orders/:id/invoice) ---
  // On la met AVANT :userId pour éviter que NestJS confonde "123/invoice" avec un User ID
  @Get(':id/invoice')
  async downloadInvoice(@Param('id') id: string, @Res() res: Response) {
    const buffer = await this.ordersService.generateInvoice(id);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename=facture_cyna_${id}.pdf`,
      'Content-Length': buffer.length,
    });

    res.end(buffer);
  }

  // --- 4. ADMIN : CHANGER STATUT (PATCH /orders/:id/status) ---
  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body('status') status: string) {
    return this.ordersService.updateStatus(id, status);
  }

  // --- 5. USER : HISTORIQUE (GET /orders/:userId) ---
  // On place celle-ci EN DERNIER car c'est une route "fourre-tout" (:userId)
  @Get(':userId')
  findAllByUser(@Param('userId') userId: string) {
    return this.ordersService.findAllByUser(userId);
  }
}