import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { FavoritesService } from './favorites.service';
import { RequestUser } from '../../shared/decorators/request-user.decorator';
import { JwtAuthGuard } from '../auth/jwt/jwt-auth.guard';

@Controller('favorites')
@UseGuards(JwtAuthGuard)
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @Get()
  findAll(@RequestUser('id') userId: number) {
    return this.favoritesService.findAll(userId);
  }

  @Post()
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
  remove(@RequestUser('id') userId: number, @Param('id') id: string) {
    return this.favoritesService.remove(userId, id);
  }
}
