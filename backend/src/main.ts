import * as dotenv from 'dotenv';
dotenv.config();

import { json, urlencoded } from 'express';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors(); 

  // Augmenter la limite de taille du corps de la requête pour accepter les images (jusqu'à 10 Mo)
  app.use(json({ limit: '10mb' }));
  app.use(urlencoded({ extended: true, limit: '10mb' }));

  await app.listen(3000);
}
bootstrap();