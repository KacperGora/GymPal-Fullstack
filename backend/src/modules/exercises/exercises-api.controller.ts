import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt/jwt-auth.guard';
import { RequestUser } from '../../shared/decorators/request-user.decorator';
import { ZodValidationPipe } from '../../shared/pipes/zod-validation.pipe';
import {
  createFavoriteExerciseSchema,
  type WgerCategory,
  type WgerEquipment,
  type WgerExercise,
  type WgerMuscle,
  type WgerPaginated,
} from '@gympal/shared';
import type { CreateFavoriteExerciseDto } from '@gympal/shared';
import type { FavoriteExercise } from '../../generated/prisma/client';
import { WgerService } from './wger.service';
import { FavoriteExercisesService } from './favorite-exercises.service';

@Controller('exercises-api')
@UseGuards(JwtAuthGuard)
export class ExercisesApiController {
  constructor(
    private readonly wgerService: WgerService,
    private readonly favoriteExercisesService: FavoriteExercisesService,
  ) {}

  @Get()
  async findAll(
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
    @Query('lang') lang?: string,
  ): Promise<WgerPaginated> {
    return this.wgerService.fetchExercises(
      limit ? parseInt(limit, 10) : 20,
      offset ? parseInt(offset, 10) : 0,
      lang,
    );
  }

  @Get('categories')
  async getCategories(): Promise<WgerCategory[]> {
    return this.wgerService.fetchCategories();
  }

  @Get('muscles')
  async getMuscles(): Promise<WgerMuscle[]> {
    return this.wgerService.fetchMuscles();
  }

  @Get('equipment')
  async getEquipment(): Promise<WgerEquipment[]> {
    return this.wgerService.fetchEquipment();
  }

  @Get('category/:categoryId')
  async findByCategory(
    @Param('categoryId', ParseIntPipe) categoryId: number,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
    @Query('lang') lang?: string,
  ): Promise<WgerPaginated> {
    return this.wgerService.fetchExercisesByCategory(
      categoryId,
      limit ? parseInt(limit, 10) : 20,
      offset ? parseInt(offset, 10) : 0,
      lang,
    );
  }

  @Get('muscle/:muscleId')
  async findByMuscle(
    @Param('muscleId', ParseIntPipe) muscleId: number,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
    @Query('lang') lang?: string,
  ): Promise<WgerPaginated> {
    return this.wgerService.fetchExercisesByMuscle(
      muscleId,
      limit ? parseInt(limit, 10) : 20,
      offset ? parseInt(offset, 10) : 0,
      lang,
    );
  }

  @Get('equipment/:equipmentId')
  async findByEquipment(
    @Param('equipmentId', ParseIntPipe) equipmentId: number,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
    @Query('lang') lang?: string,
  ): Promise<WgerPaginated> {
    return this.wgerService.fetchExercisesByEquipment(
      equipmentId,
      limit ? parseInt(limit, 10) : 20,
      offset ? parseInt(offset, 10) : 0,
      lang,
    );
  }

  @Get('search/:term')
  async searchByName(
    @Param('term') term: string,
    @Query('limit') limit?: string,
    @Query('lang') lang?: string,
  ): Promise<WgerExercise[]> {
    return this.wgerService.searchExercises(
      term,
      limit ? parseInt(limit, 10) : 20,
      lang,
    );
  }

  @Get('favorites')
  async getFavorites(
    @RequestUser('id') userId: number,
  ): Promise<FavoriteExercise[]> {
    return this.favoriteExercisesService.findAll(userId);
  }

  @Get('favorites/ids')
  async getFavoriteIds(@RequestUser('id') userId: number): Promise<number[]> {
    return this.favoriteExercisesService.getFavoriteIds(userId);
  }

  @Post('favorites')
  async addFavorite(
    @RequestUser('id') userId: number,
    @Body(new ZodValidationPipe(createFavoriteExerciseSchema))
    body: CreateFavoriteExerciseDto,
  ): Promise<FavoriteExercise> {
    return this.favoriteExercisesService.create(userId, body);
  }

  @Delete('favorites/:id')
  async removeFavorite(
    @RequestUser('id') userId: number,
    @Param('id') id: string,
  ): Promise<{ id: string }> {
    return this.favoriteExercisesService.remove(userId, id);
  }

  @Get('exercise/:id')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @Query('lang') lang?: string,
  ): Promise<WgerExercise> {
    return this.wgerService.fetchExerciseById(id, lang);
  }
}
