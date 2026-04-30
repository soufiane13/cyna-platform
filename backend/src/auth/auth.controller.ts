import { Controller, Post, Get, Put, Delete, Body, Param, Headers, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('login')
  login(@Body() body: any) {
    return this.authService.login(body);
  }

  @Post('register')
  register(@Body() body: any) {
    return this.authService.register(body);
  }

  @Post('reset-password')
  resetPassword(@Body() body: any) {
    return this.authService.resetPassword(body);
  }

  @Post('update-password')
  updatePassword(@Body() body: any, @Headers('authorization') authHeader: string) {
    if (!authHeader) throw new UnauthorizedException('Token manquant');
    return this.authService.updatePassword(body, authHeader.split(' ')[1]);
  }

  @Post('2fa/setup')
  setup2FA(@Headers('authorization') authHeader: string) {
    if (!authHeader) throw new UnauthorizedException('Token manquant');
    return this.authService.setup2FA(authHeader.split(' ')[1]);
  }

  @Post('2fa/verify')
  verify2FA(@Body() body: any, @Headers('authorization') authHeader: string) {
    if (!authHeader) throw new UnauthorizedException('Token manquant');
    return this.authService.verify2FA(body, authHeader.split(' ')[1]);
  }

  @Get('users')
  getAllUsers() {
    return this.authService.getAllUsers();
  }

  // ✅ ROUTE MANQUANTE — ajoutée ici
  @Delete('users/:id')
  deleteUser(@Param('id') id: string) {
    return this.authService.deleteUser(id);
  }

  @Put('profile/:id')
  updateProfile(@Param('id') id: string, @Body() body: any) {
    return this.authService.updateProfile(id, body);
  }
}