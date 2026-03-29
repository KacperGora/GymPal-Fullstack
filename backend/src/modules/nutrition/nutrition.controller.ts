import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { ApiOperation } from '@nestjs/swagger';
import { ApiResponse } from '@nestjs/swagger';
import { ApiTags } from '@nestjs/swagger';
import { NutritionService } from './nutrition.service';
import { RequestUser } from '../../shared/decorators/request-user.decorator';
import { JwtAuthGuard } from '../auth/jwt/jwt-auth.guard';
import { ZodValidationPipe } from '../../shared/pipes/zod-validation.pipe';
import { nutritionQuerySchema } from '@gympal/shared';
import type { NutritionQueryDto } from '@gympal/shared';
import { OwnershipGuard } from '../../shared/guards/ownership.guard';

@ApiTags('nutrition')
@ApiBearerAuth()
@Controller('nutrition')
@UseGuards(JwtAuthGuard)
export class NutritionController {
  constructor(private readonly nutritionService: NutritionService) {}

  @Get('daily-stats')
  @UseGuards(OwnershipGuard)
  @ApiOperation({ summary: 'Get daily nutrition statistics' })
  @ApiResponse({ status: 200, description: 'Returns daily nutrition stats' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getDailyStats(
    @RequestUser('id') userId: number,
    @Query('clientId') clientId?: string,
  ) {
    const targetUser = clientId ? parseInt(clientId, 10) : userId;
    return this.nutritionService.calculateDailyStats(targetUser);
  }

  @Get('weekly-stats')
  @ApiOperation({ summary: 'Get weekly nutrition statistics' })
  @ApiResponse({ status: 200, description: 'Returns weekly nutrition stats' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getWeeklyStats(
    @RequestUser('id') userId: number,
    @Query(new ZodValidationPipe(nutritionQuerySchema))
    query: NutritionQueryDto,
  ) {
    return this.nutritionService.getWeeklyStats(userId, query.date);
  }

  @Get('tdee')
  @ApiOperation({ summary: 'Get Total Daily Energy Expenditure' })
  @ApiResponse({ status: 200, description: 'Returns TDEE calculation' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getTDEE(@RequestUser('id') userId: number) {
    return this.nutritionService.getTDEE(userId);
  }
}
