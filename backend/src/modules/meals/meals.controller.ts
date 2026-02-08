import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { ApiOperation } from '@nestjs/swagger';
import { ApiResponse } from '@nestjs/swagger';
import { ApiTags } from '@nestjs/swagger';
import { MealsService } from './meals.service';
import { ZodValidationPipe } from '../../shared/pipes/zod-validation.pipe';
import { RequestUser } from '../../shared/decorators/request-user.decorator';
import { createMealSchema, updateMealSchema } from '@gympal/shared';
import type { CreateMealDto, UpdateMealDto } from '@gympal/shared';
import { JwtAuthGuard } from '../auth/jwt/jwt-auth.guard';

@ApiTags('meals')
@ApiBearerAuth()
@Controller('meals')
@UseGuards(JwtAuthGuard)
export class MealsController {
  constructor(private mealsService: MealsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new meal' })
  @ApiResponse({ status: 201, description: 'Meal created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  create(
    @RequestUser('id') userId: number,
    @Body(new ZodValidationPipe(createMealSchema)) dto: CreateMealDto,
  ) {
    return this.mealsService.create(userId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all meals for user' })
  @ApiResponse({ status: 200, description: 'Returns list of meals' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findAll(@RequestUser('id') userId: number, @Query('date') date?: string) {
    return this.mealsService.findAll(userId, date);
  }

  @Get('recent')
  @ApiOperation({ summary: 'Get recent meals' })
  @ApiResponse({ status: 200, description: 'Returns recent meals' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findRecent(@RequestUser('id') userId: number) {
    return this.mealsService.findRecent(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific meal' })
  @ApiResponse({ status: 200, description: 'Returns meal details' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Meal not found' })
  findOne(@RequestUser('id') userId: number, @Param('id') id: string) {
    return this.mealsService.findOne(userId, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a meal' })
  @ApiResponse({ status: 200, description: 'Meal updated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Meal not found' })
  update(
    @RequestUser('id') userId: number,
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateMealSchema)) dto: UpdateMealDto,
  ) {
    return this.mealsService.update(userId, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a meal' })
  @ApiResponse({ status: 200, description: 'Meal deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Meal not found' })
  remove(@RequestUser('id') userId: number, @Param('id') id: string) {
    return this.mealsService.remove(userId, id);
  }
}
