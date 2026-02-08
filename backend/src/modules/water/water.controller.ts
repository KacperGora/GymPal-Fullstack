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
    @Query('date') date: string,
  ) {
    return this.waterService.getWaterIntake(userId, date);
  }

  @Post('add')
  @ApiOperation({ summary: 'Add a glass of water' })
  @ApiResponse({ status: 201, description: 'Glass added successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  addGlass(@RequestUser('id') userId: number, @Query('date') date: string) {
    return this.waterService.addGlass(userId, date);
  }

  @Post('remove')
  @ApiOperation({ summary: 'Remove a glass of water' })
  @ApiResponse({ status: 200, description: 'Glass removed successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  removeGlass(@RequestUser('id') userId: number, @Query('date') date: string) {
    return this.waterService.removeGlass(userId, date);
  }
}
