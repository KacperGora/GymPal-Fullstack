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

  async getWeeklyStats(userId: number, endDate: string) {
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    const start = new Date(end);
    start.setDate(start.getDate() - 6);
    start.setHours(0, 0, 0, 0);

    const meals = await this.prisma.meal.findMany({
      where: {
        userId,
        date: {
          gte: start,
          lte: end,
        },
      },
      select: {
        date: true,
        calories: true,
      },
    });

    // Group by date and sum calories
    const dailyMap = new Map<string, number>();

    // Initialize all 7 days with 0
    for (let i = 0; i < 7; i++) {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      const dateKey = d.toISOString().split('T')[0];
      dailyMap.set(dateKey, 0);
    }

    // Sum calories for each day
    for (const meal of meals) {
      const dateKey = meal.date.toISOString().split('T')[0];
      const current = dailyMap.get(dateKey) ?? 0;
      dailyMap.set(dateKey, current + meal.calories);
    }

    // Convert to array
    const result = Array.from(dailyMap.entries()).map(([date, calories]) => ({
      date,
      calories,
    }));

    return result.sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    );
  }

  async getTDEE(userId: number) {
    const profile = await this.prisma.userProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      throw new NotFoundException('User profile not found');
    }

    // Mifflin-St Jeor formula for BMR
    const bmr = Math.round(
      10 * profile.weight + 6.25 * profile.height - 5 * profile.age + 5,
    );

    const tdee = Math.round(bmr * profile.activity);

    // Calculate target calories based on goal
    let targetCalories = tdee;
    if (profile.goal === 'LOSE') targetCalories = Math.round(tdee * 0.8);
    if (profile.goal === 'GAIN') targetCalories = Math.round(tdee * 1.15);

    return {
      bmr,
      tdee,
      targetCalories,
      goal: profile.goal,
    };
  }
}
