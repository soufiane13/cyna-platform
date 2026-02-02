import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config'; // <--- Important
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { OrdersModule } from './orders/orders.module';

@Module({
  imports: [
    OrdersModule,
    ConfigModule.forRoot(),
    AuthModule // <--- C'est ça qui charge les clés Supabase
    
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}