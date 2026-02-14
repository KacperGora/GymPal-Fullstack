import { Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { WaterService } from './water.service';
import { RequestUser } from '../../shared/decorators/request-user.decorator';
import { JwtAuthGuard } from '../auth/jwt/jwt-auth.guard';
import { ZodValidationPipe } from '../../shared/pipes/zod-validation.pipe';
import { waterQuerySchema } from '@gympal/shared';
import type { WaterQueryDto } from '@gympal/shared';

@ApiTags('water')
@ApiBearerAuth()
@Controller('water')
@UseGuards(JwtAuthGuard)
export class WaterController {
  constructor(private readonly waterService: WaterService) {}

  @Get()
  @ApiOperation({ summary: 'Get water intake for a specific date' })
  @ApiResponse({ status: 200, description: 'Returns water intake data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getWaterIntake(
    @RequestUser('id') userId: number,
    @Query(new ZodValidationPipe(waterQuerySchema)) query: WaterQueryDto,
  ) {
    return this.waterService.getWaterIntake(userId, query.date);
  }

  @Post('add')
  @ApiOperation({ summary: 'Add a glass of water' })
  @ApiResponse({ status: 201, description: 'Glass added successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  addGlass(
    @RequestUser('id') userId: number,
    @Query(new ZodValidationPipe(waterQuerySchema)) query: WaterQueryDto,
  ) {
    return this.waterService.addGlass(userId, query.date);
  }

  @Post('remove')
  @ApiOperation({ summary: 'Remove a glass of water' })
  @ApiResponse({ status: 200, description: 'Glass removed successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  removeGlass(
    @RequestUser('id') userId: number,
    @Query(new ZodValidationPipe(waterQuerySchema)) query: WaterQueryDto,
  ) {
    return this.waterService.removeGlass(userId, query.date);
  }
}
