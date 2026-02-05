import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../shared/db/prisma.service';
import type { FavoriteExercise } from '../../generated/prisma/client';
import type { CreateFavoriteExerciseDto } from '@gympal/shared';

@Injectable()
export class FavoriteExercisesService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId: number): Promise<FavoriteExercise[]> {
    const favorites = await this.prisma.favoriteExercise.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    return favorites;
  }

  async create(
    userId: number,
    data: CreateFavoriteExerciseDto,
  ): Promise<FavoriteExercise> {
    const favorite = await this.prisma.favoriteExercise.create({
      data: {
        userId,
        wgerExerciseId: data.wgerExerciseId,
        name: data.name,
        category: data.category,
        muscles: data.muscles,
        equipment: data.equipment,
        imageUrl: data.imageUrl,
      },
    });
    return favorite;
  }

  async remove(userId: number, id: string): Promise<{ id: string }> {
    const result = await this.prisma.favoriteExercise.deleteMany({
      where: { id, userId },
    });

    if (result.count === 0) {
      throw new NotFoundException('Favorite exercise not found');
    }

    return { id };
  }

  async getFavoriteIds(userId: number): Promise<number[]> {
    const favorites = await this.prisma.favoriteExercise.findMany({
      where: { userId },
      select: { wgerExerciseId: true },
    });
    return favorites.map((f) => f.wgerExerciseId);
  }
}
