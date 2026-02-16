import { Body, Controller, HttpStatus, Post, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import type {
  MealSuggestionRequest,
  MealSuggestionsResponse,
} from '@gympal/shared';
import { mealSuggestionRequestSchema } from '@gympal/shared';

import { JwtAuthGuard } from '../auth/jwt/jwt-auth.guard';
import { RequestUser } from '../../shared/decorators/request-user.decorator';
import { ZodValidationPipe } from '../../shared/pipes/zod-validation.pipe';
import { AiService } from './ai.service';

@ApiTags('ai')
@Controller('ai')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AiController {
  constructor(private aiService: AiService) {}

  @Post('meal-suggestions')
  @ApiOperation({ summary: 'Generate AI meal suggestions' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Meal suggestions generated successfully',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid request body or validation error',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'User is not authenticated',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'User profile not found',
  })
  @ApiResponse({
    status: HttpStatus.SERVICE_UNAVAILABLE,
    description: 'AI service is unavailable',
  })
  async getMealSuggestions(
    @RequestUser('id') userId: number,
    @Body(new ZodValidationPipe(mealSuggestionRequestSchema))
    dto: MealSuggestionRequest,
  ): Promise<MealSuggestionsResponse> {
    return this.aiService.generateMealSuggestions(userId, dto);
  }
}
