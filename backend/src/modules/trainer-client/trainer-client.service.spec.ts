import { TrainerClientService } from './trainer-client.service';
import { PrismaService } from '../../shared/db/prisma.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('TrainerClientService', () => {
  let service: TrainerClientService;
  let prisma: {
    trainerClient: {
      create: jest.Mock;
      findUnique: jest.Mock;
      update: jest.Mock;
      findMany: jest.Mock;
      findFirst: jest.Mock;
    };
  };

  beforeEach(() => {
    prisma = {
      trainerClient: {
        create: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        findFirst: jest.fn(),
        findMany: jest.fn(),
      },
    };
    service = new TrainerClientService(prisma as unknown as PrismaService);
  });

  describe('createInviteLink', () => {
    it('returns token and link', async () => {
      prisma.trainerClient.create.mockResolvedValue({ inviteToken: 'abc-123' });

      const result = await service.createInviteLink(1);

      expect(result.token).toBeDefined();
      expect(result.link).toContain(result.token);
    });
  });
  describe('acceptInviteLink', () => {
    it('token does not exists', async () => {
      prisma.trainerClient.findUnique.mockResolvedValue(null);

      await expect(service.acceptInvite(1, 'invalid')).rejects.toThrow(
        NotFoundException,
      );
    });
    it('throws BadRequestException when relation is already ACTIVE', async () => {
      prisma.trainerClient.findUnique.mockResolvedValue({ status: 'ACTIVE' });

      await expect(service.acceptInvite(1, 'token')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('accepts invite and return updated relation', async () => {
      prisma.trainerClient.findUnique.mockResolvedValue({
        status: 'PENDING',
        inviteToken: 'token',
      });
      prisma.trainerClient.update.mockResolvedValue({ status: 'ACTIVE' });

      const result = await service.acceptInvite(1, 'token');

      expect(result.status).toBe('ACTIVE');
    });
  });

  describe('revokeClient', () => {
    it('throws NotFoundException when relation does not exist', async () => {
      prisma.trainerClient.findUnique.mockResolvedValue(null);

      await expect(service.revokeClient(1, 5)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('revokes client successfully', async () => {
      prisma.trainerClient.findUnique.mockResolvedValue({ status: 'ACTIVE' });
      prisma.trainerClient.update.mockResolvedValue({ status: 'REVOKED' });

      const result = await service.revokeClient(1, 5);
      expect(result.status).toBe('REVOKED');
    });
  });

  describe('getClients', () => {
    it('returns list of active clients for trainer', async () => {
      prisma.trainerClient.findMany.mockResolvedValue([
        { clientId: 1, status: 'ACTIVE' },
        { clientId: 2, status: 'ACTIVE' },
      ]);

      const result = await service.getClients(1);

      expect(result).toHaveLength(2);
    });

    it('returns empty array when trainer has no clients', async () => {
      prisma.trainerClient.findMany.mockResolvedValue([]);

      const result = await service.getClients(1);

      expect(result).toHaveLength(0);
    });
  });

  describe('getClientDetails', () => {
    it('returns client details for active relation', async () => {
      prisma.trainerClient.findUnique.mockResolvedValue({
        id: '1',
        status: 'ACTIVE',
        acceptedAt: new Date(),
        client: {
          id: 5,
          firstName: 'Alice',
          lastName: 'Strong',
          email: 'alice@example.com',
        },
      });

      const result = await service.getClientDetails(1, 5);

      expect(result.client).toBeDefined();
      expect(result.status).toBe('ACTIVE');
    });

    it('throws NotFoundException when relation does not exist', async () => {
      prisma.trainerClient.findUnique.mockResolvedValue(null);

      await expect(service.getClientDetails(1, 99)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('throws NotFoundException when relation is not ACTIVE', async () => {
      prisma.trainerClient.findUnique.mockResolvedValue({
        id: '1',
        status: 'REVOKED',
        client: { id: 5 },
      });

      await expect(service.getClientDetails(1, 5)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getTrainer', () => {
    it('returns trainer for client', async () => {
      prisma.trainerClient.findFirst.mockResolvedValue({
        trainer: {
          id: 1,
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
        },
      });

      const result = await service.getTrainer(5);

      expect(result).toBeDefined();
    });

    it('returns null when client has no trainer', async () => {
      prisma.trainerClient.findFirst.mockResolvedValue(null);

      const result = await service.getTrainer(5);

      expect(result).toBeNull();
    });
  });
});
