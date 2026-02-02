import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello() { // <--- J'ai retiré ": string" ici. C'est ça qui bloquait !
    return this.appService.getHello();
  }
}