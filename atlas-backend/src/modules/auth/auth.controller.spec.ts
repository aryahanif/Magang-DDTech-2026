import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UnauthorizedException } from '@nestjs/common';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            validateUser: jest.fn(),
            login: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('login', () => {
    it('should throw UnauthorizedException if credentials are wrong', async () => {
      jest.spyOn(authService, 'validateUser').mockResolvedValue(null);

      await expect(
        controller.login({ email: 'test@test.com', password: 'wrong' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should return a token if credentials are correct', async () => {
      const mockUser = { id: '123', email: 'test@test.com', name: 'Admin', role: 'Super Admin' };
      jest.spyOn(authService, 'validateUser').mockResolvedValue(mockUser);
      jest.spyOn(authService, 'login').mockResolvedValue({ success: true, token: 'fake_token', user: mockUser });

      const result = await controller.login({ email: 'test@test.com', password: 'correct' });

      expect(result).toHaveProperty('token', 'fake_token');
      expect(result.success).toBe(true);
    });
  });
});
