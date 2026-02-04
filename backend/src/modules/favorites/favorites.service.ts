import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../shared/db/prisma.service';
import { MealCategory } from '../../generated/prisma/enums';

interface CreateFavoriteDto {
  name: string;
  calories: number;
  proteins: number;
  carbs: number;
  fats: number;
  category?: MealCategory;
}

@Injectable()
export class FavoritesService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId: number) {
    const favorites = await this.prisma.favoriteMeal.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    return favorites;
  }

  async create(userId: number, data: CreateFavoriteDto) {
    const favorite = await this.prisma.favoriteMeal.create({
      data: {
        userId,
        name: data.name,
        calories: data.calories,
        proteins: data.proteins,
        carbs: data.carbs,
        fats: data.fats,
        category: data.category ?? 'SNACK',
      },
    });
    return favorite;
  }

  async remove(userId: number, id: string) {
    const result = await this.prisma.favoriteMeal.deleteMany({
      where: { id, userId },
    });
    return result;
  }
}
