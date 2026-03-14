import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../shared/db/prisma.service';

@Injectable()
export class DailyStatService {
  private readonly logger = new Logger(DailyStatService.name);

  constructor(private prisma: PrismaService) {}

  async recalculate(userId: number, date: Date): Promise<void> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const stats = await this.prisma.meal.aggregate({
      where: {
        userId,
        date: { gte: startOfDay, lte: endOfDay },
      },
      _sum: {
        calories: true,
        proteins: true,
        carbs: true,
        fats: true,
      },
    });

    const calories = stats._sum.calories ?? 0;
    const proteins = stats._sum.proteins ?? 0;
    const carbs = stats._sum.carbs ?? 0;
    const fats = stats._sum.fats ?? 0;

    await this.prisma.dailyStat.upsert({
      where: { userId_date: { userId, date: startOfDay } },
      update: { calories, proteins, carbs, fats },
      create: { userId, date: startOfDay, calories, proteins, carbs, fats },
    });

    this.logger.debug(
      `Recalculated DailyStat for user=${userId}, date=${startOfDay.toISOString()}: cal=${calories}, p=${proteins}, c=${carbs}, f=${fats}`,
    );
  }
}
