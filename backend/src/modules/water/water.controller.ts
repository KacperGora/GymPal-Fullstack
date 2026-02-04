import { Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { WaterService } from './water.service';
import { RequestUser } from '../../shared/decorators/request-user.decorator';
import { JwtAuthGuard } from '../auth/jwt/jwt-auth.guard';

@Controller('water')
@UseGuards(JwtAuthGuard)
export class WaterController {
  constructor(private readonly waterService: WaterService) {}

  @Get()
  getWaterIntake(
    @RequestUser('id') userId: number,
    @Query('date') date: string,
  ) {
    return this.waterService.getWaterIntake(userId, date);
  }

  @Post('add')
  addGlass(@RequestUser('id') userId: number, @Query('date') date: string) {
    return this.waterService.addGlass(userId, date);
  }

  @Post('remove')
  removeGlass(@RequestUser('id') userId: number, @Query('date') date: string) {
    return this.waterService.removeGlass(userId, date);
  }
}
