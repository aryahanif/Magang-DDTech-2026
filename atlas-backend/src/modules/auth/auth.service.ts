import { Injectable, BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private prisma: PrismaService
  ) {}

  async register(name: string, email: string, passwordRaw: string, role: string) {
    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new BadRequestException('User with this email already exists');
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(passwordRaw, salt);

    const user = await this.prisma.user.create({
      data: {
        name,
        email,
        password_hash,
        role
      }
    });

    return { success: true, message: 'User registered successfully', userId: user.id };
  }

  async login(email: string, passwordRaw: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user || !user.password_hash) {
      return null;
    }

    const isMatch = await bcrypt.compare(passwordRaw, user.password_hash);
    if (!isMatch) {
      return null;
    }

    const payload = { sub: user.id, email: user.email, role: user.role, name: user.name };
    const token = this.jwtService.sign(payload);

    return {
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    };
  }
}
