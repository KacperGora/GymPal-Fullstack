import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../shared/db/prisma.service';

@Injectable()
export class NutritionService {
  constructor(private prisma: PrismaService) {}
  async calculateDailyStats(userId: number, date: Date = new Date()) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const stats = await this.prisma.meal.aggregate({
      where: {
        userId,
        date: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      _sum: {
        calories: true,
        carbs: true,
        proteins: true,
        fats: true,
      },
    });
    return { ...stats._sum };
  }
  async getTDEE(userId: number) {
    const profile = await this.prisma.userProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      throw new NotFoundException('User profile not found');
    }

    let bmr = 10 * profile.weight + 6.25 * profile.height - 5 * profile.age + 5;
    if (profile.goal === 'lose') bmr *= 0.8;
    if (profile.goal === 'gain') bmr *= 1.2;

    const tdee = bmr * profile.activity;
    return tdee;
  }
}
