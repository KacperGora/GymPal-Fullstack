jest.mock('../../shared/db/prisma.service');
jest.mock('@gympal/shared', () => ({
  registerSchema: { parse: jest.fn() },
  loginSchema: { parse: jest.fn() },
  ACCESS_TOKEN_COOKIE: 'access_token',
  REFRESH_TOKEN_COOKIE: 'refresh_token',
  HAS_PROFILE_COOKIE: 'has_profile',
  HAS_PROFILE_TRUE: '1',
  HAS_PROFILE_FALSE: '0',
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
    refresh: jest.fn(),
    revokeRefreshToken: jest.fn(),
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
    const mockRes = {
      cookie: jest.fn(),
    } as unknown as import('express').Response;

    const webReq = {
      headers: { 'user-agent': 'test-agent' },
      ip: '127.0.0.1',
      socket: { remoteAddress: '127.0.0.1' },
    } as unknown as import('express').Request;

    const mobileReq = {
      headers: { 'user-agent': 'test-agent', 'x-client-type': 'mobile' },
      ip: '127.0.0.1',
      socket: { remoteAddress: '127.0.0.1' },
    } as unknown as import('express').Request;

    const registerServiceResponse = {
      id: 'user-id',
      email: 'a@a.pl',
      hasProfile: false,
      token: 'jwt',
      refreshToken: 'refresh',
    };

    const dto: RegisterDto = {
      firstName: 'Kacper',
      lastName: 'G.',
      email: 'a@a.pl',
      password: '12345678',
    };

    it('should set cookies and omit tokens from body for web clients', async () => {
      mockAuthService.register.mockResolvedValue(registerServiceResponse);

      const result = await controller.register(dto, webReq, mockRes);

      expect(mockAuthService.register).toHaveBeenCalledWith(dto, {
        userAgent: 'test-agent',
        ipAddress: '127.0.0.1',
      });
      expect(mockRes.cookie).toHaveBeenCalledWith(
        'access_token',
        'jwt',
        expect.objectContaining({ httpOnly: true }),
      );
      expect(mockRes.cookie).toHaveBeenCalledWith(
        'refresh_token',
        'refresh',
        expect.objectContaining({ httpOnly: true }),
      );
      expect(mockRes.cookie).toHaveBeenCalledWith(
        'has_profile',
        '0',
        expect.objectContaining({ httpOnly: true }),
      );
      expect(result).toEqual({
        id: 'user-id',
        email: 'a@a.pl',
        hasProfile: false,
      });
    });

    it('should set cookies and return tokens in body for mobile clients', async () => {
      mockAuthService.register.mockResolvedValue(registerServiceResponse);

      const result = await controller.register(dto, mobileReq, mockRes);

      expect(result).toEqual({
        id: 'user-id',
        email: 'a@a.pl',
        hasProfile: false,
        accessToken: 'jwt',
        refreshToken: 'refresh',
      });
    });

    it('should throw BadRequestException when email already exists', async () => {
      mockAuthService.register.mockRejectedValue(
        new BadRequestException('Email already in use'),
      );

      await expect(controller.register(dto, webReq, mockRes)).rejects.toThrow(
        BadRequestException,
      );
      expect(mockAuthService.register).toHaveBeenCalledWith(dto, {
        userAgent: 'test-agent',
        ipAddress: '127.0.0.1',
      });
    });
  });

  describe('login', () => {
    const mockRes = {
      cookie: jest.fn(),
    } as unknown as import('express').Response;

    const webReq = {
      headers: { 'user-agent': 'test-agent' },
      ip: '127.0.0.1',
      socket: { remoteAddress: '127.0.0.1' },
    } as unknown as import('express').Request;

    const mobileReq = {
      headers: { 'user-agent': 'test-agent', 'x-client-type': 'mobile' },
      ip: '127.0.0.1',
      socket: { remoteAddress: '127.0.0.1' },
    } as unknown as import('express').Request;

    const loginServiceResponse = {
      id: 'user-id',
      email: 'a@a.pl',
      token: 'jwt',
      refreshToken: 'refresh',
      hasProfile: false,
    };

    const expectedCookieCalls = (mockResCookie: jest.Mock) => {
      expect(mockResCookie).toHaveBeenCalledWith('access_token', 'jwt', {
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        path: '/',
        maxAge: 15 * 60 * 1000,
      });
      expect(mockResCookie).toHaveBeenCalledWith('refresh_token', 'refresh', {
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        path: '/',
        maxAge: 30 * 24 * 60 * 60 * 1000,
      });
      expect(mockResCookie).toHaveBeenCalledWith('has_profile', '0', {
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        path: '/',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });
    };

    it('should set cookies and omit tokens from body for web clients', async () => {
      const dto: LoginDto = { email: 'a@a.pl', password: '12345678' };
      mockAuthService.login.mockResolvedValue(loginServiceResponse);

      const result = await controller.login(dto, webReq, mockRes);

      expect(mockAuthService.login).toHaveBeenCalledWith(dto, {
        userAgent: 'test-agent',
        ipAddress: '127.0.0.1',
      });
      expectedCookieCalls(mockRes.cookie as jest.Mock);
      expect(result).toEqual({
        id: 'user-id',
        email: 'a@a.pl',
        hasProfile: false,
      });
    });

    it('should set cookies and return tokens in body for mobile clients', async () => {
      const dto: LoginDto = { email: 'a@a.pl', password: '12345678' };
      mockAuthService.login.mockResolvedValue(loginServiceResponse);

      const result = await controller.login(dto, mobileReq, mockRes);

      expectedCookieCalls(mockRes.cookie as jest.Mock);
      expect(result).toEqual({
        id: 'user-id',
        email: 'a@a.pl',
        hasProfile: false,
        accessToken: 'jwt',
        refreshToken: 'refresh',
      });
    });

    it('should throw UnauthorizedException for invalid credentials', async () => {
      const dto: LoginDto = {
        email: 'wrong@example.com',
        password: '12345678',
      };

      mockAuthService.login.mockRejectedValue(
        new UnauthorizedException('Invalid credentials'),
      );

      await expect(controller.login(dto, webReq, mockRes)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(mockAuthService.login).toHaveBeenCalledWith(dto, {
        userAgent: 'test-agent',
        ipAddress: '127.0.0.1',
      });
    });
  });

  describe('refresh', () => {
    const mockRes = {
      cookie: jest.fn(),
    } as unknown as import('express').Response;

    const refreshServiceResponse = {
      accessToken: 'new-jwt',
      refreshToken: 'new-refresh',
      hasProfile: true,
    };

    it('should set new cookies and return success for web clients', async () => {
      const mockReq = {
        cookies: { refresh_token: 'refresh' },
        headers: { 'user-agent': 'test-agent' },
        ip: '127.0.0.1',
        socket: { remoteAddress: '127.0.0.1' },
      } as unknown as import('express').Request;

      mockAuthService.refresh.mockResolvedValue(refreshServiceResponse);

      const result = await controller.refresh(mockReq, mockRes);

      expect(mockAuthService.refresh).toHaveBeenCalledWith('refresh', {
        userAgent: 'test-agent',
        ipAddress: '127.0.0.1',
      });
      expect(mockRes.cookie).toHaveBeenCalledWith('access_token', 'new-jwt', {
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        path: '/',
        maxAge: 15 * 60 * 1000,
      });
      expect(mockRes.cookie).toHaveBeenCalledWith(
        'refresh_token',
        'new-refresh',
        {
          httpOnly: true,
          secure: false,
          sameSite: 'lax',
          path: '/',
          maxAge: 30 * 24 * 60 * 60 * 1000,
        },
      );
      expect(mockRes.cookie).toHaveBeenCalledWith('has_profile', '1', {
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        path: '/',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });
      expect(result).toEqual({ success: true });
    });

    it('should set cookies and return tokens in body for mobile clients', async () => {
      const mockReq = {
        cookies: {},
        headers: { 'user-agent': 'test-agent', 'x-client-type': 'mobile' },
        ip: '127.0.0.1',
        socket: { remoteAddress: '127.0.0.1' },
      } as unknown as import('express').Request;

      mockAuthService.refresh.mockResolvedValue(refreshServiceResponse);

      const result = await controller.refresh(mockReq, mockRes, 'refresh');

      expect(result).toEqual({
        accessToken: 'new-jwt',
        refreshToken: 'new-refresh',
      });
    });

    it('should throw UnauthorizedException when refresh token missing', async () => {
      const mockReq = {
        cookies: {},
        headers: {},
        ip: '127.0.0.1',
        socket: { remoteAddress: '127.0.0.1' },
      } as unknown as import('express').Request;

      await expect(controller.refresh(mockReq, mockRes)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('logout', () => {
    const mockRes = {
      clearCookie: jest.fn(),
    } as unknown as import('express').Response;

    it('should revoke refresh token and clear cookies', async () => {
      const mockReq = {
        cookies: { refresh_token: 'refresh' },
      } as unknown as import('express').Request;

      const result = await controller.logout(mockReq, mockRes);

      expect(mockAuthService.revokeRefreshToken).toHaveBeenCalledWith(
        'refresh',
      );
      expect(mockRes.clearCookie).toHaveBeenCalledWith('access_token', {
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        path: '/',
      });
      expect(mockRes.clearCookie).toHaveBeenCalledWith('refresh_token', {
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        path: '/',
      });
      expect(mockRes.clearCookie).toHaveBeenCalledWith('has_profile', {
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        path: '/',
      });
      expect(result).toEqual({ success: true });
    });
  });
});
