import { Module } from '@nestjs/common';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { OpenAiService } from './openai.service';
import { PromptBuilder } from './prompt.builder';
import { PrismaModule } from '../../shared/db/prisma.module';
import { NutritionModule } from '../nutrition/nutrition.module';

@Module({
  imports: [PrismaModule, NutritionModule],
  controllers: [AiController],
  providers: [AiService, OpenAiService, PromptBuilder],
})
export class AiModule {}
