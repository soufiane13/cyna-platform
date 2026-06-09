import { Controller, Get, Post, Body } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello() { return this.appService.getHello(); }

  @Get('test-db') // Route de diagnostic
  checkDbConnection() { return this.appService.checkDbConnection(); }

  @Get('products') // Ta route produits
  getProducts() { return this.appService.getProducts(); }

  @Get('alert') // Lire l'alerte
  getAlert() { return this.appService.getAlert(); }

  @Post('alert') // Modifier l'alerte
  updateAlert(@Body('message') message: string) {
    return this.appService.updateAlert(message);
  }

  // --- ROUTES CARROUSEL ---
  @Get('carousel') // Lire le carrousel
  getCarousel() { 
    return this.appService.getCarousel(); 
  }

  @Post('carousel') // Mettre à jour le carrousel
  updateCarousel(@Body('items') items: any[]) {
    return this.appService.updateCarousel(items);
  }

  // --- ROUTES HERO BACKGROUND ---
  @Get('hero-bg')
  getHeroBg() { 
    return this.appService.getHeroBg(); 
  }

  @Post('hero-bg')
  updateHeroBg(@Body('image_url') imageUrl: string) {
    return this.appService.updateHeroBg(imageUrl);
  }

  @Get('top-products')
  getTopProducts() {
    return this.appService.getTopProducts();
  }

  @Post('top-products/order')
  updateTopProductsOrder(@Body('order') order: string[]) {
    return this.appService.updateTopProductsOrder(order);
  }
}