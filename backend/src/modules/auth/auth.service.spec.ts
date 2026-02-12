jest.mock('../../shared/db/prisma.service');
jest.mock('../../shared/lib/hash');
jest.mock('crypto', () => ({
  createHash: jest.fn().mockReturnValue({
    update: jest.fn().mockReturnValue({
      digest: jest.fn().mockReturnValue('mocked-hash'),
    }),
  }),
  randomBytes: jest.fn().mockReturnValue({
    toString: jest.fn().mockReturnValue('mocked-random-token'),
  }),
  randomUUID: jest.fn().mockReturnValue('mocked-uuid'),
}));

import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import crypto from 'crypto';
import { AuthService } from './auth.service';
import { PrismaService } from '../../shared/db/prisma.service';
import { hashPassword, comparePassword } from '../../shared/lib/hash';

const mockJwtService = {
  sign: jest.fn().mockReturnValue('mock-jwt'),
};

describe('AuthService', () => {
  let service: AuthService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              findUnique: jest.fn(),
              create: jest.fn(),
            },
            refreshToken: {
              create: jest.fn(),
              findUnique: jest.fn(),
              update: jest.fn(),
              updateMany: jest.fn(),
              deleteMany: jest.fn(),
            },
          },
        },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prisma = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
    // Re-setup crypto mocks after clearAllMocks
    (crypto.createHash as jest.Mock).mockReturnValue({
      update: jest.fn().mockReturnValue({
        digest: jest.fn().mockReturnValue('mocked-hash'),
      }),
    });
    (crypto.randomBytes as jest.Mock).mockReturnValue({
      toString: jest.fn().mockReturnValue('mocked-random-token'),
    });
    (crypto.randomUUID as jest.Mock).mockReturnValue('mocked-uuid');
    mockJwtService.sign.mockReturnValue('mock-jwt');
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    const dto = {
      firstName: 'Jan',
      lastName: 'Kowalski',
      email: 'jan@test.pl',
      password: 'password123',
    };

    it('should create user with hashed password and return {id, email}', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
      (hashPassword as jest.Mock).mockResolvedValue('hashed-password');
      (prisma.user.create as jest.Mock).mockResolvedValue({
        id: 1,
        email: dto.email,
      });

      const result = await service.register(dto);

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: dto.email },
      });
      expect(hashPassword).toHaveBeenCalledWith(dto.password);
      expect(prisma.user.create).toHaveBeenCalledWith({
        data: { ...dto, password: 'hashed-password' },
        select: { email: true, id: true },
      });
      expect(result).toEqual({ id: 1, email: dto.email });
    });

    it('should throw BadRequestException when email is taken', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: 1,
        email: dto.email,
      });

      await expect(service.register(dto)).rejects.toThrow(BadRequestException);
      expect(prisma.user.create).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    const dto = { email: 'jan@test.pl', password: 'password123' };
    const context = { userAgent: 'test-agent', ipAddress: '127.0.0.1' };

    it('should return user data + JWT + refresh token on valid credentials', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: 1,
        email: dto.email,
        password: 'hashed',
        userProfile: { id: 1 },
      });
      (comparePassword as jest.Mock).mockResolvedValue(true);
      (prisma.refreshToken.create as jest.Mock).mockResolvedValue({});

      const result = await service.login(dto, context);

      expect(result).toEqual({
        id: 1,
        email: dto.email,
        hasProfile: true,
        token: 'mock-jwt',
        refreshToken: 'mocked-random-token',
      });
      expect((result as { password?: string }).password).toBeUndefined();
      expect(mockJwtService.sign).toHaveBeenCalledWith({
        sub: 1,
        email: dto.email,
      });
    });

    it('should throw UnauthorizedException when user does not exist', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.login(dto, context)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException when password is wrong', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: 1,
        email: dto.email,
        password: 'hashed',
        userProfile: null,
      });
      (comparePassword as jest.Mock).mockResolvedValue(false);

      await expect(service.login(dto, context)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should set hasProfile=true when userProfile exists', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: 1,
        email: dto.email,
        password: 'hashed',
        userProfile: { id: 1 },
      });
      (comparePassword as jest.Mock).mockResolvedValue(true);
      (prisma.refreshToken.create as jest.Mock).mockResolvedValue({});

      const result = await service.login(dto, context);
      expect(result.hasProfile).toBe(true);
    });

    it('should set hasProfile=false when userProfile is null', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: 1,
        email: dto.email,
        password: 'hashed',
        userProfile: null,
      });
      (comparePassword as jest.Mock).mockResolvedValue(true);
      (prisma.refreshToken.create as jest.Mock).mockResolvedValue({});

      const result = await service.login(dto, context);
      expect(result.hasProfile).toBe(false);
    });
  });

  describe('refresh', () => {
    const context = { userAgent: 'test-agent', ipAddress: '127.0.0.1' };
    const futureDate = new Date(Date.now() + 1000 * 60 * 60 * 24);

    it('should return new access token and rotated refresh token', async () => {
      (prisma.refreshToken.findUnique as jest.Mock).mockResolvedValue({
        tokenHash: 'mocked-hash',
        familyId: 'family-1',
        userId: 1,
        expiresAt: futureDate,
        revokedAt: null,
        user: { id: 1, email: 'jan@test.pl', userProfile: { id: 1 } },
      });
      (prisma.refreshToken.update as jest.Mock).mockResolvedValue({});
      (prisma.refreshToken.create as jest.Mock).mockResolvedValue({});

      const result = await service.refresh('some-token', context);

      expect(result).toEqual({
        accessToken: 'mock-jwt',
        refreshToken: 'mocked-random-token',
        hasProfile: true,
      });
    });

    it('should revoke old token during rotation', async () => {
      (prisma.refreshToken.findUnique as jest.Mock).mockResolvedValue({
        tokenHash: 'mocked-hash',
        familyId: 'family-1',
        userId: 1,
        expiresAt: futureDate,
        revokedAt: null,
        user: { id: 1, email: 'jan@test.pl', userProfile: null },
      });
      (prisma.refreshToken.update as jest.Mock).mockResolvedValue({});
      (prisma.refreshToken.create as jest.Mock).mockResolvedValue({});

      await service.refresh('some-token', context);

      expect(prisma.refreshToken.update).toHaveBeenCalledWith({
        where: { tokenHash: 'mocked-hash' },
        data: { revokedAt: expect.any(Date) },
      });
    });

    it('should create new token in the same family', async () => {
      (prisma.refreshToken.findUnique as jest.Mock).mockResolvedValue({
        tokenHash: 'mocked-hash',
        familyId: 'family-1',
        userId: 1,
        expiresAt: futureDate,
        revokedAt: null,
        user: { id: 1, email: 'jan@test.pl', userProfile: null },
      });
      (prisma.refreshToken.update as jest.Mock).mockResolvedValue({});
      (prisma.refreshToken.create as jest.Mock).mockResolvedValue({});

      await service.refresh('some-token', context);

      expect(prisma.refreshToken.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ familyId: 'family-1', userId: 1 }),
      });
    });

    it('should throw UnauthorizedException for non-existent token', async () => {
      (prisma.refreshToken.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.refresh('bad-token', context)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException for expired token', async () => {
      const pastDate = new Date(Date.now() - 1000 * 60 * 60);
      (prisma.refreshToken.findUnique as jest.Mock).mockResolvedValue({
        tokenHash: 'mocked-hash',
        familyId: 'family-1',
        userId: 1,
        expiresAt: pastDate,
        revokedAt: null,
        user: { id: 1, email: 'jan@test.pl', userProfile: null },
      });

      await expect(service.refresh('expired-token', context)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should revoke family and throw on token reuse', async () => {
      (prisma.refreshToken.findUnique as jest.Mock).mockResolvedValue({
        tokenHash: 'mocked-hash',
        familyId: 'family-1',
        userId: 1,
        expiresAt: futureDate,
        revokedAt: new Date(),
        user: { id: 1, email: 'jan@test.pl', userProfile: null },
      });
      (prisma.refreshToken.updateMany as jest.Mock).mockResolvedValue({
        count: 3,
      });

      await expect(service.refresh('reused-token', context)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(service.refresh('reused-token', context)).rejects.toThrow(
        'Token reuse detected',
      );
      expect(prisma.refreshToken.updateMany).toHaveBeenCalledWith({
        where: { familyId: 'family-1', revokedAt: null },
        data: { revokedAt: expect.any(Date) },
      });
    });
  });

  describe('revokeRefreshToken', () => {
    it('should revoke token by hash', async () => {
      (prisma.refreshToken.updateMany as jest.Mock).mockResolvedValue({
        count: 1,
      });

      await service.revokeRefreshToken('some-token');

      expect(prisma.refreshToken.updateMany).toHaveBeenCalledWith({
        where: { tokenHash: 'mocked-hash', revokedAt: null },
        data: { revokedAt: expect.any(Date) },
      });
    });
  });

  describe('me', () => {
    it('should return user with hasProfile=true', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: 1,
        email: 'jan@test.pl',
        firstName: 'Jan',
        lastName: 'Kowalski',
        userProfile: { id: 1 },
      });

      const result = await service.me(1);

      expect(result).toEqual({
        id: 1,
        email: 'jan@test.pl',
        firstName: 'Jan',
        lastName: 'Kowalski',
        hasProfile: true,
      });
    });

    it('should return user with hasProfile=false', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: 1,
        email: 'jan@test.pl',
        firstName: 'Jan',
        lastName: 'Kowalski',
        userProfile: null,
      });

      const result = await service.me(1);
      expect(result!.hasProfile).toBe(false);
    });

    it('should return null when user does not exist', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await service.me(999);
      expect(result).toBeNull();
    });
  });

  describe('cleanupExpiredTokens', () => {
    it('should delete expired and revoked tokens', async () => {
      (prisma.refreshToken.deleteMany as jest.Mock).mockResolvedValue({
        count: 5,
      });

      await service.cleanupExpiredTokens();

      expect(prisma.refreshToken.deleteMany).toHaveBeenCalledWith({
        where: {
          OR: [
            { expiresAt: { lt: expect.any(Date) } },
            { revokedAt: { lt: expect.any(Date) } },
          ],
        },
      });
    });
  });
});
