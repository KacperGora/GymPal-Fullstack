jest.mock('../../shared/db/prisma.service');
jest.mock('@gympal/shared', () => ({
  registerSchema: { parse: jest.fn() },
  loginSchema: { parse: jest.fn() },
}));

import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';

type RegisterDto = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
};

type LoginDto = {
  email: string;
  password: string;
};

describe('AuthController', () => {
  let controller: AuthController;

  const mockAuthService = {
    register: jest.fn(),
    login: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('register', () => {
    it('should call authService.register', async () => {
      const dto: RegisterDto = {
        firstName: 'Kacper',
        lastName: 'G.',
        email: 'a@a.pl',
        password: '12345678',
      };

      mockAuthService.register.mockResolvedValue({
        id: 'user-id',
        email: dto.email,
      });

      const result = await controller.register(dto);

      expect(mockAuthService.register).toHaveBeenCalledWith(dto);
      expect(result).toEqual({ id: 'user-id', email: dto.email });
    });

    it('should throw BadRequestException when email already exists', async () => {
      const dto: RegisterDto = {
        firstName: 'Kacper',
        lastName: 'G.',
        email: 'existing@example.com',
        password: '12345678',
      };

      mockAuthService.register.mockRejectedValue(
        new BadRequestException('Email already in use'),
      );

      await expect(controller.register(dto)).rejects.toThrow(
        BadRequestException,
      );
      expect(mockAuthService.register).toHaveBeenCalledWith(dto);
    });
  });

  describe('login', () => {
    it('should call authService.login', async () => {
      const dto: LoginDto = {
        email: 'a@a.pl',
        password: '12345678',
      };

      mockAuthService.login.mockResolvedValue({
        id: 'user-id',
        email: dto.email,
        token: 'jwt',
      });

      const result = await controller.login(dto);

      expect(mockAuthService.login).toHaveBeenCalledWith(dto);
      expect(result).toEqual({ id: 'user-id', email: dto.email, token: 'jwt' });
    });

    it('should throw UnauthorizedException for invalid credentials', async () => {
      const dto: LoginDto = {
        email: 'wrong@example.com',
        password: '12345678',
      };

      mockAuthService.login.mockRejectedValue(
        new UnauthorizedException('Invalid credentials'),
      );

      await expect(controller.login(dto)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(mockAuthService.login).toHaveBeenCalledWith(dto);
    });
  });
});
