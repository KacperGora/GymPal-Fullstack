import { Module } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { OpenAiService } from './openai.service';
import { PromptBuilderV2Service } from './prompt-builder-v2.service';
import { TemplateService } from './template.service';
import { AiRetryService } from './ai-retry.service';
import { AgentController } from './agent/agent.controller';
import { AgentService } from './agent/agent.service';
import { AgentToolsService } from './agent/agent-tools.service';
import { LangfuseService } from './agent/langfuse.service';
import { RagModule } from './rag/rag.module';
import { PrismaModule } from '../../shared/db/prisma.module';
import { NutritionModule } from '../nutrition/nutrition.module';
import { WorkoutsModule } from '../workouts/workouts.module';
import { MealsModule } from '../meals/meals.module';
import { ExercisesModule } from '../exercises/exercises.module';
import { CacheService } from '../../shared/services/cache.service';
import { MacroCalculatorService } from '../../shared/services/macro-calculator.service';
import { MealValidatorService } from '../../shared/services/meal-validator.service';
import { UsageLimitGuard } from '../../shared/guards/usage-limit.guard';
import { UserProfileModule } from '../user-profile/user-profile.module';

@Module({
  imports: [
    PrismaModule,
    NutritionModule,
    WorkoutsModule,
    MealsModule,
    ExercisesModule,
    UserProfileModule,
    RagModule,
  ],
  controllers: [AiController, AgentController],
  providers: [
    AiService,
    AiRetryService,
    CacheService,
    PromptBuilderV2Service,
    TemplateService,
    OpenAiService,
    MacroCalculatorService,
    MealValidatorService,
    UsageLimitGuard,
    Reflector,
    AgentService,
    AgentToolsService,
    LangfuseService,
  ],
  exports: [AiService, TemplateService, CacheService],
})
export class AiModule {}
