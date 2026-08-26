import { Controller, Post, Body, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() body: any) {
    if (!body.email || !body.password) {
      throw new BadRequestException('Email and password are required');
    }
    const result = await this.authService.login(body.email, body.password);
    if (!result) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return result;
  }

  @Post('register')
  async register(@Body() body: any) {
    if (!body.email || !body.password || !body.name) {
      throw new BadRequestException('Name, email, and password are required');
    }
    return this.authService.register(body.name, body.email, body.password, body.role || 'Admin');
  }
}
