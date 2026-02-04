import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { NutritionService } from './nutrition.service';
import { RequestUser } from '../../shared/decorators/request-user.decorator';
import { JwtAuthGuard } from '../auth/jwt/jwt-auth.guard';

@Controller('nutrition')
@UseGuards(JwtAuthGuard)
export class NutritionController {
  constructor(private readonly nutritionService: NutritionService) {}

  @Get('daily-stats')
  getDailyStats(@RequestUser('id') userId: number) {
    return this.nutritionService.calculateDailyStats(userId);
  }

  @Get('weekly-stats')
  getWeeklyStats(
    @RequestUser('id') userId: number,
    @Query('date') date: string,
  ) {
    return this.nutritionService.getWeeklyStats(userId, date);
  }

  @Get('tdee')
  getTDEE(@RequestUser('id') userId: number) {
    return this.nutritionService.getTDEE(userId);
  }
}
