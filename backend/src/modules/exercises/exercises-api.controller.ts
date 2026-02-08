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
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
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

@ApiTags('exercises')
@ApiBearerAuth()
@Controller('exercises-api')
@UseGuards(JwtAuthGuard)
export class ExercisesApiController {
  constructor(
    private readonly wgerService: WgerService,
    private readonly favoriteExercisesService: FavoriteExercisesService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get all exercises from WGER API' })
  @ApiResponse({
    status: 200,
    description: 'Returns paginated list of exercises',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
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
  @ApiOperation({ summary: 'Get all exercise categories' })
  @ApiResponse({ status: 200, description: 'Returns list of categories' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getCategories(): Promise<WgerCategory[]> {
    return this.wgerService.fetchCategories();
  }

  @Get('muscles')
  @ApiOperation({ summary: 'Get all muscle groups' })
  @ApiResponse({ status: 200, description: 'Returns list of muscle groups' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getMuscles(): Promise<WgerMuscle[]> {
    return this.wgerService.fetchMuscles();
  }

  @Get('equipment')
  @ApiOperation({ summary: 'Get all equipment types' })
  @ApiResponse({ status: 200, description: 'Returns list of equipment types' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getEquipment(): Promise<WgerEquipment[]> {
    return this.wgerService.fetchEquipment();
  }

  @Get('category/:categoryId')
  @ApiOperation({ summary: 'Get exercises by category' })
  @ApiResponse({
    status: 200,
    description: 'Returns paginated list of exercises in category',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
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
  @ApiOperation({ summary: 'Get exercises by muscle group' })
  @ApiResponse({
    status: 200,
    description: 'Returns paginated list of exercises for muscle',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
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
  @ApiOperation({ summary: 'Get exercises by equipment type' })
  @ApiResponse({
    status: 200,
    description: 'Returns paginated list of exercises for equipment',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
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
  @ApiOperation({ summary: 'Search exercises by name' })
  @ApiResponse({
    status: 200,
    description: 'Returns list of matching exercises',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
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
  @ApiOperation({ summary: 'Get user favorite exercises' })
  @ApiResponse({
    status: 200,
    description: 'Returns list of favorite exercises',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getFavorites(
    @RequestUser('id') userId: number,
  ): Promise<FavoriteExercise[]> {
    return this.favoriteExercisesService.findAll(userId);
  }

  @Get('favorites/ids')
  @ApiOperation({ summary: 'Get user favorite exercise IDs' })
  @ApiResponse({
    status: 200,
    description: 'Returns array of favorite exercise IDs',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getFavoriteIds(@RequestUser('id') userId: number): Promise<number[]> {
    return this.favoriteExercisesService.getFavoriteIds(userId);
  }

  @Post('favorites')
  @ApiOperation({ summary: 'Add exercise to favorites' })
  @ApiResponse({ status: 201, description: 'Exercise added to favorites' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async addFavorite(
    @RequestUser('id') userId: number,
    @Body(new ZodValidationPipe(createFavoriteExerciseSchema))
    body: CreateFavoriteExerciseDto,
  ): Promise<FavoriteExercise> {
    return this.favoriteExercisesService.create(userId, body);
  }

  @Delete('favorites/:id')
  @ApiOperation({ summary: 'Remove exercise from favorites' })
  @ApiResponse({ status: 200, description: 'Exercise removed from favorites' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Favorite not found' })
  async removeFavorite(
    @RequestUser('id') userId: number,
    @Param('id') id: string,
  ): Promise<{ id: string }> {
    return this.favoriteExercisesService.remove(userId, id);
  }

  @Get('exercise/:id')
  @ApiOperation({ summary: 'Get specific exercise by ID' })
  @ApiResponse({ status: 200, description: 'Returns exercise details' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Exercise not found' })
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @Query('lang') lang?: string,
  ): Promise<WgerExercise> {
    return this.wgerService.fetchExerciseById(id, lang);
  }
}
