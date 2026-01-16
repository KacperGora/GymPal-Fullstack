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

  async findAll(userId: number) {
    const mealList = await this.prisma.meal.findMany({
      where: { userId },
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
    const meal = await this.findOne(userId, id);
    return this.prisma.meal.update({
      where: { id: meal.id },
      data: dto,
    });
  }

  async remove(userId: number, id: string) {
    const meal = await this.findOne(userId, id);
    await this.prisma.meal.delete({ where: { id: meal.id } });
    return { id };
  }
}
