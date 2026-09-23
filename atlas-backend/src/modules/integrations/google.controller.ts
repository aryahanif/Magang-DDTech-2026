import { Controller, Get, Post, Query, Req, Res, UseGuards, UnauthorizedException } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import type { Request, Response } from 'express';
import { GoogleService } from './google.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('api/integrations/google')
@Throttle({ default: { limit: 100, ttl: 60000 } })
export class GoogleController {
  constructor(private readonly googleService: GoogleService) {}

  @UseGuards(JwtAuthGuard)
  @Get('auth')
  async getAuthUrl(@Req() req: Request & { user: { id: string } }, @Res() res: Response) {
    const url = this.googleService.getAuthUrl(req.user.id);
    return res.redirect(url);
  }

  @Get('callback')
  async handleCallback(@Query('code') code: string, @Query('state') state: string, @Res() res: Response) {
    if (!code || !state) {
      return res.status(400).json({ success: false, message: 'Invalid callback parameters' });
    }
    
    // In OAuth, we passed the userId via the state parameter
    const userId = state;
    
    try {
      await this.googleService.handleCallback(code, userId);
      // Redirect back to frontend settings page on success
      return res.redirect(process.env.FRONTEND_URL ? `${process.env.FRONTEND_URL}/admin/settings` : 'http://localhost:5173/admin/settings');
    } catch (error) {
      return res.status(500).json({ success: false, message: 'OAuth failed' });
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post('disconnect')
  async disconnect(@Req() req: Request & { user: { id: string } }) {
    return this.googleService.disconnect(req.user.id);
  }
}
