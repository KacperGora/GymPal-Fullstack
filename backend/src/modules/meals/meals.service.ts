import { Injectable, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../../shared/db/prisma.service';
import { NutritionStatsProducer } from '../jobs/nutrition-stats.producer';
import { CreateMealDto, UpdateMealDto } from '@gympal/shared';

@Injectable()
export class MealsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly statsProducer: NutritionStatsProducer,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  private toDateString(date: Date | string): string {
    return new Date(date).toISOString().split('T')[0];
  }

  async create(userId: number, dto: CreateMealDto) {
    const meal = await this.prisma.meal.create({
      data: { ...dto, userId },
    });
    await this.statsProducer.scheduleRecalculation(
      userId,
      this.toDateString(meal.date),
    );
    this.eventEmitter.emit('meal.created', { userId, mealId: meal.id });
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
    const updated = await this.prisma.$transaction(async (tx) => {
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
    await this.statsProducer.scheduleRecalculation(
      userId,
      this.toDateString(updated.date),
    );
    return updated;
  }

  async remove(userId: number, id: string) {
    const meal = await this.prisma.meal.findFirst({ where: { userId, id } });
    if (!meal) {
      throw new NotFoundException('Meal not found or not owned by user');
    }
    await this.prisma.meal.delete({ where: { id } });
    await this.statsProducer.scheduleRecalculation(
      userId,
      this.toDateString(meal.date),
    );
    return { id };
  }

  async findRecent(userId: number, limit = 6) {
    const meals = await this.prisma.meal.findMany({
      where: { userId },
      distinct: ['name', 'calories', 'proteins', 'carbs', 'fats', 'category'],
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: {
        name: true,
        calories: true,
        proteins: true,
        carbs: true,
        fats: true,
        category: true,
      },
    });
    return meals;
  }
}
