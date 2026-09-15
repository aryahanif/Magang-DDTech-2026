import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { google } from 'googleapis';

@Injectable()
export class GoogleService {
  private readonly logger = new Logger(GoogleService.name);
  private oauth2Client;

  constructor(private readonly prisma: PrismaService) {
    this.oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID || 'dummy_client_id',
      process.env.GOOGLE_CLIENT_SECRET || 'dummy_client_secret',
      process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/api/integrations/google/callback'
    );
  }

  getAuthUrl(userId: string): string {
    const scopes = [
      'https://www.googleapis.com/auth/gmail.send',
      'https://www.googleapis.com/auth/calendar.events',
    ];

    return this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      state: userId,
      prompt: 'consent'
    });
  }

  async handleCallback(code: string, userId: string) {
    try {
      const { tokens } = await this.oauth2Client.getToken(code);
      
      await this.prisma.user.update({
        where: { id: userId },
        data: {
          google_access_token: tokens.access_token,
          google_refresh_token: tokens.refresh_token,
        },
      });

      return { success: true, message: 'Google account connected successfully' };
    } catch (error) {
      this.logger.error('Failed to handle Google OAuth callback', error);
      throw new Error('Failed to connect Google account');
    }
  }

  async disconnect(userId: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        google_access_token: null,
        google_refresh_token: null,
      },
    });

    return { success: true, message: 'Google account disconnected successfully' };
  }
}
