import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { MealsService } from './meals.service';
import { ZodValidationPipe } from '../../shared/pipes/zod-validation.pipe';
import { RequestUser } from '../../shared/decorators/request-user.decorator';
import { createMealSchema, updateMealSchema } from '@gympal/shared';
import type { CreateMealDto, UpdateMealDto } from '@gympal/shared';
import { JwtAuthGurad } from '../auth/jwt/jwt-auth.gurad';

@Controller('meals')
@UseGuards(JwtAuthGurad)
export class MealsController {
  constructor(private mealsService: MealsService) {}

  @Post()
  create(
    @RequestUser('id') userId: number,
    @Body(new ZodValidationPipe(createMealSchema)) dto: CreateMealDto,
  ) {
    return this.mealsService.create(userId, dto);
  }

  @Get()
  findAll(@RequestUser('id') userId: number) {
    return this.mealsService.findAll(userId);
  }

  @Get(':id')
  findOne(@RequestUser('id') userId: number, @Param('id') id: string) {
    return this.mealsService.findOne(userId, id);
  }

  @Patch(':id')
  update(
    @RequestUser('id') userId: number,
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateMealSchema)) dto: UpdateMealDto,
  ) {
    return this.mealsService.update(userId, id, dto);
  }

  @Delete(':id')
  remove(@RequestUser('id') userId: number, @Param('id') id: string) {
    return this.mealsService.remove(userId, id);
  }
}
