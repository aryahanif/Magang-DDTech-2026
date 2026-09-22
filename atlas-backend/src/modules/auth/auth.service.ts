import { Injectable, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../database/prisma.service';
import { EmailService } from '../email/email.service';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

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
    private emailService: EmailService,
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

  async forgotPassword(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      return { success: true, message: 'If that email is in our database, we have sent a password reset link to it.' };
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');

    const resetTokenExpires = new Date();
    resetTokenExpires.setHours(resetTokenExpires.getHours() + 1);

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        reset_password_token: resetTokenHash,
        reset_password_expires: resetTokenExpires,
      },
    });

    const resetUrl = `http://localhost:5173/reset-password?token=${resetToken}&email=${email}`;

    try {
      if (user.email) {
        await this.emailService.sendPasswordResetEmail(user.email, resetUrl);
      } else {
        console.warn('User has no email address');
      }
    } catch (e) {
      console.error('Failed to send reset email', e);
    }

    return { success: true, message: 'If that email is in our database, we have sent a password reset link to it.' };
  }

  async resetPassword(email: string, token: string, newPassword: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    
    if (!user || !user.reset_password_token || !user.reset_password_expires) {
      throw new BadRequestException('Invalid or expired password reset token');
    }

    if (user.reset_password_expires < new Date()) {
      throw new BadRequestException('Invalid or expired password reset token');
    }

    const resetTokenHash = crypto.createHash('sha256').update(token).digest('hex');

    if (user.reset_password_token !== resetTokenHash) {
      throw new BadRequestException('Invalid or expired password reset token');
    }

    const salt = await bcrypt.genSalt();
    const newPasswordHash = await bcrypt.hash(newPassword, salt);

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        password_hash: newPasswordHash,
        reset_password_token: null,
        reset_password_expires: null,
      },
    });

    return { success: true, message: 'Password has been successfully reset. You can now login.' };
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.password_hash) {
      throw new BadRequestException('User not found');
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isMatch) {
      throw new BadRequestException('Incorrect current password');
    }

    const salt = await bcrypt.genSalt();
    const newPasswordHash = await bcrypt.hash(newPassword, salt);

    await this.prisma.user.update({
      where: { id: userId },
      data: { password_hash: newPasswordHash },
    });

    return { success: true, message: 'Password has been successfully updated.' };
  }
}
