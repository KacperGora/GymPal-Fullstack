import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../shared/db/prisma.service';
import { Role } from '../../generated/prisma/enums';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async getUsers() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
      },
      orderBy: { id: 'desc' },
    });
  }

  async getStats() {
    const [total, byRole, activeRelations] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.groupBy({ by: ['role'], _count: { id: true } }),
      this.prisma.trainerClient.count({ where: { status: 'ACTIVE' } }),
    ]);

    return {
      total,
      byRole: Object.fromEntries(byRole.map((r) => [r.role, r._count.id])),
      activeTrainerClientRelations: activeRelations,
    };
  }

  async updateUserRole(userId: number, role: Role) {
    const result = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!result) {
      throw new NotFoundException('User not found');
    }
    return await this.prisma.user.update({
      where: { id: userId },
      data: { role },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
      },
    });
  }
}
