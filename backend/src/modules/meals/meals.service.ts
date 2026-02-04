import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../shared/db/prisma.service';
import { CreateMealDto, UpdateMealDto } from '@gympal/shared';

@Injectable()
export class MealsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: number, dto: CreateMealDto) {
    const meal = await this.prisma.meal.create({
      data: { ...dto, userId },
    });
    return meal;
  }

  async findAll(userId: number, date?: string) {
    const where: { userId: number; date?: { gte: Date; lt: Date } } = {
      userId,
    };

    if (date) {
      const startOfDay = new Date(date);
      const endOfDay = new Date(date);
      endOfDay.setDate(endOfDay.getDate() + 1);
      where.date = { gte: startOfDay, lt: endOfDay };
    }

    const mealList = await this.prisma.meal.findMany({
      where,
      orderBy: { date: 'desc' },
    });
    return mealList;
  }

  async findOne(userId: number, id: string) {
    const meal = await this.prisma.meal.findFirst({
      where: { id, userId },
    });

    if (!meal) {
      throw new NotFoundException('Meal not found');
    }
    return meal;
  }

  async update(userId: number, id: string, dto: UpdateMealDto) {
    return this.prisma.$transaction(async (tx) => {
      const meal = await tx.meal.findFirst({
        where: { userId, id },
      });
      if (!meal) {
        throw new NotFoundException('Meal not found');
      }
      return tx.meal.update({
        where: { id },
        data: dto,
      });
    });
  }

  async remove(userId: number, id: string) {
    const deleted = await this.prisma.meal.deleteMany({
      where: { userId, id },
    });
    if (deleted.count === 0) {
      throw new NotFoundException('Meal not found or not owned by user');
    }
    return { id };
  }

  async findRecent(userId: number, limit = 6) {
    const meals = await this.prisma.$queryRaw<
      {
        name: string;
        calories: number;
        proteins: number;
        carbs: number;
        fats: number;
        category: string;
      }[]
    >`
      SELECT name, calories, proteins, carbs, fats, category
      FROM (
        SELECT DISTINCT ON (name, calories, proteins, carbs, fats, category)
          name, calories, proteins, carbs, fats, category, "createdAt"
        FROM "Meal"
        WHERE "userId" = ${userId}
      ) AS unique_meals
      ORDER BY "createdAt" DESC
      LIMIT ${limit}
    `;
    return meals;
  }
}
