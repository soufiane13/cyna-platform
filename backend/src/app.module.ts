import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { CouponsModule } from './orders/coupons.module'; // Importez CouponsModule
import { OrdersModule } from './orders/orders.module';
import { ChatModule } from './chat/chat.module';
import { ProductModule } from './product/product.module';
import { MessagesModule } from '../messages.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AuthModule,
    CouponsModule, // Ajoutez CouponsModule ici
    OrdersModule,
    ChatModule,
    ProductModule,
    MessagesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}