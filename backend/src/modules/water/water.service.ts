import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../shared/db/prisma.service';

@Injectable()
export class WaterService {
  constructor(private prisma: PrismaService) {}

  async getWaterIntake(userId: number, date: string) {
    const dateObj = new Date(date);

    const intake = await this.prisma.waterIntake.findUnique({
      where: {
        userId_date: { userId, date: dateObj },
      },
    });

    return { glasses: intake?.glasses ?? 0 };
  }

  async updateWaterIntake(userId: number, date: string, glasses: number) {
    const dateObj = new Date(date);

    const intake = await this.prisma.waterIntake.upsert({
      where: {
        userId_date: { userId, date: dateObj },
      },
      update: { glasses },
      create: { userId, date: dateObj, glasses },
    });

    return { glasses: intake.glasses };
  }

  async addGlass(userId: number, date: string) {
    const dateObj = new Date(date);

    const intake = await this.prisma.waterIntake.upsert({
      where: {
        userId_date: { userId, date: dateObj },
      },
      update: { glasses: { increment: 1 } },
      create: { userId, date: dateObj, glasses: 1 },
    });

    return { glasses: intake.glasses };
  }

  async removeGlass(userId: number, date: string) {
    const dateObj = new Date(date);

    const existing = await this.prisma.waterIntake.findUnique({
      where: {
        userId_date: { userId, date: dateObj },
      },
    });

    if (!existing || existing.glasses <= 0) {
      return { glasses: 0 };
    }

    const intake = await this.prisma.waterIntake.update({
      where: {
        userId_date: { userId, date: dateObj },
      },
      data: { glasses: { decrement: 1 } },
    });

    return { glasses: intake.glasses };
  }
}
