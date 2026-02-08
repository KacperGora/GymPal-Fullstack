import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { FavoritesService } from './favorites.service';
import { RequestUser } from '../../shared/decorators/request-user.decorator';
import { JwtAuthGuard } from '../auth/jwt/jwt-auth.guard';

@ApiTags('favorites')
@ApiBearerAuth()
@Controller('favorites')
@UseGuards(JwtAuthGuard)
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all favorite meals' })
  @ApiResponse({ status: 200, description: 'Returns list of favorite meals' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findAll(@RequestUser('id') userId: number) {
    return this.favoritesService.findAll(userId);
  }

  @Post()
  @ApiOperation({ summary: 'Add a meal to favorites' })
  @ApiResponse({
    status: 201,
    description: 'Favorite meal created successfully',
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  create(
    @RequestUser('id') userId: number,
    @Body()
    body: {
      name: string;
      calories: number;
      proteins: number;
      carbs: number;
      fats: number;
      category?: 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK';
    },
  ) {
    return this.favoritesService.create(userId, body);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove a meal from favorites' })
  @ApiResponse({
    status: 200,
    description: 'Favorite meal removed successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Favorite not found' })
  remove(@RequestUser('id') userId: number, @Param('id') id: string) {
    return this.favoritesService.remove(userId, id);
  }
}
