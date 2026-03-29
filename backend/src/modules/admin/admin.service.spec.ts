import { NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../shared/db/prisma.service';
import { AdminService } from './admin.service';

describe('AdminService', () => {
  let service: AdminService;
  let prisma: {
    user: {
      findMany: jest.Mock;
      findUnique: jest.Mock;
      update: jest.Mock;
      count: jest.Mock;
      groupBy: jest.Mock;
    };
    trainerClient: {
      count: jest.Mock;
    };
  };

  beforeEach(() => {
    prisma = {
      user: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        count: jest.fn(),
        groupBy: jest.fn(),
      },
      trainerClient: {
        count: jest.fn(),
      },
    };
    service = new AdminService(prisma as unknown as PrismaService);
  });

  describe('getUsers', () => {
    it('returns list of users', async () => {
      prisma.user.findMany.mockResolvedValue([
        { id: 1, email: 'admin@gympal.app', role: 'ADMIN' },
        { id: 2, email: 'trainer@gympal.app', role: 'TRAINER' },
      ]);

      const result = await service.getUsers();

      expect(result).toHaveLength(2);
    });

    it('returns empty array when no users', async () => {
      prisma.user.findMany.mockResolvedValue([]);

      const result = await service.getUsers();

      expect(result).toHaveLength(0);
    });
  });

  describe('updateUserRole', () => {
    it('updates user role successfully', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: 1, role: 'CLIENT' });
      prisma.user.update.mockResolvedValue({ id: 1, role: 'TRAINER' });

      const result = await service.updateUserRole(1, 'TRAINER');

      expect(result.role).toBe('TRAINER');
    });

    it('throws NotFoundException when user does not exist', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(service.updateUserRole(99, 'TRAINER')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getStats', () => {
    it('returns stats with user counts by role', async () => {
      prisma.user.count.mockResolvedValue(10);
      prisma.user.groupBy.mockResolvedValue([
        { role: 'CLIENT', _count: { id: 7 } },
        { role: 'TRAINER', _count: { id: 2 } },
        { role: 'ADMIN', _count: { id: 1 } },
      ]);
      prisma.trainerClient.count.mockResolvedValue(3);

      const result = await service.getStats();

      expect(result.total).toBe(10);
      expect(result.byRole).toEqual({ CLIENT: 7, TRAINER: 2, ADMIN: 1 });
      expect(result.activeTrainerClientRelations).toBe(3);
    });
  });
});
