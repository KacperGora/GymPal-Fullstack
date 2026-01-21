import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../shared/db/prisma.service';

@Injectable()
export class NutritionService {
  constructor(private prisma: PrismaService) {}
  async calculateDailyStats(userId: number, date: Date = new Date()) {
    const stats = this.prisma.meal.aggregate({
      where: {
        userId,
        date: {
          gte: new Date(date.setHours(0, 0, 0, 0)),
          lte: new Date(date.setHours(23, 59, 59, 999)),
        },
      },
      _sum: {
        calories: true,
        carbs: true,
        proteins: true,
        fats: true,
      },
    });
    return { ...(await stats)._sum };
  }
  async getTDEE(userId: number) {
    const profile = await this.prisma.userProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      throw new Error('User profile not found');
    }

    let bmr = 10 * profile.weight + 6.25 * profile.height - 5 * profile.age + 5;
    if (profile.goal === 'lose') bmr *= 0.8;
    if (profile.goal === 'gain') bmr *= 1.2;

    const tdee = bmr * profile.activity;
    return tdee;
  }
}
