import { Body, Controller, Post, Get, Put, Param, Headers, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  login(@Body() body: any) {
    return this.authService.login(body);
  }

  @Post('register')
  register(@Body() body: any) {
    return this.authService.register(body);
  }

  
  @Post('update-password')
  updatePassword(@Body() body: any, @Headers('authorization') authHeader: string) {
    if (!authHeader) {
      throw new UnauthorizedException('Token d\'authentification manquant');
    }
    
    const token = authHeader.split(' ')[1]; // On retire le mot "Bearer " pour garder uniquement le token
    return this.authService.updatePassword(body, token);
  }

  // NOUVEAU : Récupérer le QR Code 2FA
  @Post('2fa/setup')
  setup2FA(@Headers('authorization') authHeader: string) {
    if (!authHeader) {
      throw new UnauthorizedException('Token d\'authentification manquant');
    }
    const token = authHeader.split(' ')[1];
    return this.authService.setup2FA(token);
  }

  // NOUVEAU : Valider le code 2FA saisi par l'admin
  @Post('2fa/verify')
  verify2FA(@Body() body: any, @Headers('authorization') authHeader: string) {
    if (!authHeader) {
      throw new UnauthorizedException('Token d\'authentification manquant');
    }
    const token = authHeader.split(' ')[1];
    return this.authService.verify2FA(body, token);
  }

  // NOUVEAU : Récupérer la liste des utilisateurs (Admin)
  @Get('users')
  getAllUsers() {
    return this.authService.getAllUsers();
  }

  // NOUVEAU : Mettre à jour le profil d'un utilisateur
  @Put('profile/:id')
  updateProfile(@Param('id') id: string, @Body() body: any) {
    return this.authService.updateProfile(id, body);
  }

}