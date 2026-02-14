import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { MealSuggestionRequest } from '@gympal/shared';
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
  async getMealSuggestions(
    @RequestUser('id') userId: number,
    @Body(new ZodValidationPipe(mealSuggestionRequestSchema))
    dto: MealSuggestionRequest,
  ) {
    return this.aiService.generateMealSuggestions(userId, dto);
  }
}
