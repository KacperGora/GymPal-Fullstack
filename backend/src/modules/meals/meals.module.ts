import { Module } from '@nestjs/common';
import { MealsService } from './meals.service';
import { MealsController } from './meals.controller';
import { PrismaService } from '../../shared/db/prisma.service';
import { JwtAuthGuard } from '../auth/jwt/jwt-auth.guard';

@Module({
  providers: [MealsService, PrismaService, JwtAuthGuard],
  controllers: [MealsController],
})
export class MealsModule {}
