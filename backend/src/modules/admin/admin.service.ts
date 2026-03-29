import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../shared/db/prisma.service';
import { Role } from '../../generated/prisma/enums';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async getUsers() {
    return await this.prisma.user.findMany({});
  }

  async getStats() {
    return {
      total: await this.prisma.user.count(),
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
      data: {
        role: role,
      },
    });
  }
}
