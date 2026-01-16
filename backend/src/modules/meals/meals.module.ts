import { Module } from '@nestjs/common';
import { MealsService } from './meals.service';
import { MealsController } from './meals.controller';
import { PrismaService } from '../../shared/db/prisma.service';
import { JwtAuthGurad } from '../auth/jwt/jwt-auth.gurad';

@Module({
  providers: [MealsService, PrismaService, JwtAuthGurad],
  controllers: [MealsController],
})
export class MealsModule {}
