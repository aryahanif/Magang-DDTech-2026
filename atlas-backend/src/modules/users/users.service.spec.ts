import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { UsersService } from './users.service';
import { PrismaService } from '../../database/prisma.service';

function prismaError(code: string) {
  return new Prisma.PrismaClientKnownRequestError('mock', { code, clientVersion: 'x' });
}

describe('UsersService', () => {
  let service: UsersService;
  let prisma: { user: Record<string, jest.Mock> };

  beforeEach(async () => {
    prisma = {
      user: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        update: jest.fn(),
        create: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [UsersService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('getProfile throws NotFoundException when user is missing', async () => {
    prisma.user.findUnique.mockResolvedValue(null);
    await expect(service.getProfile('missing-id')).rejects.toThrow(NotFoundException);
  });

  it('updateProfile throws ConflictException on duplicate email', async () => {
    prisma.user.update.mockRejectedValue(prismaError('P2002'));
    await expect(service.updateProfile('id', { email: 'taken@test.com' })).rejects.toThrow(
      ConflictException,
    );
  });

  it('invite throws ConflictException on duplicate email', async () => {
    prisma.user.create.mockRejectedValue(prismaError('P2002'));
    await expect(
      service.invite({ name: 'New', email: 'taken@test.com' }),
    ).rejects.toThrow(ConflictException);
  });

  it('updateRole throws NotFoundException when user is missing', async () => {
    prisma.user.update.mockRejectedValue(prismaError('P2025'));
    await expect(service.updateRole('missing-id', { role: 'Admin' })).rejects.toThrow(
      NotFoundException,
    );
  });
});
