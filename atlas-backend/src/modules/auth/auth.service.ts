import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../database/prisma.service';
import * as bcrypt from 'bcrypt';

export interface SafeUser {
  id: string;
  email: string | null;
  name: string | null;
  role: string | null;
  job_title?: string | null;
  email_signature?: string | null;
  google_access_token?: string | null;
  google_refresh_token?: string | null;
  created_at: Date;
}

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, pass: string): Promise<SafeUser | null> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (user && user.password_hash) {
      const isMatch = await bcrypt.compare(pass, user.password_hash);
      if (isMatch) {
        const { password_hash, ...result } = user;
        return result as SafeUser;
      }
    }
    return null;
  }

  async login(user: SafeUser) {
    const payload = { email: user.email, sub: user.id, role: user.role };
    return {
      success: true,
      token: await this.jwtService.signAsync(payload),
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      }
    };
  }
}
