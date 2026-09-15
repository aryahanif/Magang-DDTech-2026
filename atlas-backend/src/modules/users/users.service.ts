import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../database/prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { InviteUserDto } from './dto/invite-user.dto';
import { UpdateRoleDto } from './dto/update-role.dto';

const DEFAULT_INVITE_PASSWORD = 'Welcome123!';

const PUBLIC_USER_FIELDS = {
  id: true,
  name: true,
  email: true,
  role: true,
  job_title: true,
  created_at: true,
};

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: PUBLIC_USER_FIELDS,
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async updateProfile(userId: string, data: UpdateProfileDto) {
    try {
      return await this.prisma.user.update({
        where: { id: userId },
        data,
        select: PUBLIC_USER_FIELDS,
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') throw new NotFoundException('User not found');
        if (error.code === 'P2002') throw new ConflictException('Email already in use');
      }
      throw error;
    }
  }

  async findAll() {
    return this.prisma.user.findMany({
      select: PUBLIC_USER_FIELDS,
      orderBy: { created_at: 'asc' },
    });
  }

  async invite(data: InviteUserDto) {
    const password_hash = await bcrypt.hash(DEFAULT_INVITE_PASSWORD, 10);
    try {
      return await this.prisma.user.create({
        data: {
          name: data.name,
          email: data.email,
          role: data.role ?? 'Member',
          password_hash,
        },
        select: PUBLIC_USER_FIELDS,
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException('Email already in use');
      }
      throw error;
    }
  }

  async updateRole(userId: string, data: UpdateRoleDto) {
    try {
      return await this.prisma.user.update({
        where: { id: userId },
        data: { role: data.role },
        select: PUBLIC_USER_FIELDS,
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new NotFoundException('User not found');
      }
      throw error;
    }
  }
}
