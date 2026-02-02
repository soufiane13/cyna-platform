import { Controller, Get, Post, Body } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello() { return this.appService.getHello(); }

  @Get('products') // Ta route produits
  getProducts() { return this.appService.getProducts(); }

  @Get('alert') // Lire l'alerte
  getAlert() { return this.appService.getAlert(); }

  @Post('alert') // Modifier l'alerte
  updateAlert(@Body('message') message: string) {
    return this.appService.updateAlert(message);
  }
}