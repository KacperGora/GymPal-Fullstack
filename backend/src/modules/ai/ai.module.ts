import { Module } from '@nestjs/common';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { OpenAiService } from './openai.service';
import { PromptBuilderV2Service } from './prompt-builder-v2.service';
import { TemplateService } from './template.service';
import { AiRetryService } from './ai-retry.service';
import { PrismaModule } from '../../shared/db/prisma.module';
import { NutritionModule } from '../nutrition/nutrition.module';
import { CacheService } from '../../shared/services/cache.service';
import { MacroCalculatorService } from '../../shared/services/macro-calculator.service';
import { MealValidatorService } from '../../shared/services/meal-validator.service';

@Module({
  imports: [PrismaModule, NutritionModule],
  controllers: [AiController],
  providers: [
    AiService,
    AiRetryService,
    CacheService,
    PromptBuilderV2Service,
    TemplateService,
    OpenAiService,
    MacroCalculatorService,
    MealValidatorService,
  ],
  exports: [AiService, TemplateService, CacheService],
})
export class AiModule {}
