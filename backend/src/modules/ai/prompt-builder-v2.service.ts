import { Injectable, Logger } from '@nestjs/common';
import { MealCategory } from '../../generated/prisma/enums';
import type { MealTemplate } from './template.service';
import * as crypto from 'crypto';

export interface PromptBuilderContext {
  category: MealCategory;
  targetCalories: number;
  remaining: {
    calories: number;
    proteins: number;
    carbs: number;
    fats: number;
  };
  language: string;
  count: number;
  dietaryRestrictions?: string[];
  templates: MealTemplate[];
}

export interface PromptResult {
  system: string;
  user: string;
  metadata: {
    tokenEstimate: number;
    templateCount: number;
  };
}

@Injectable()
export class PromptBuilderV2Service {
  private readonly logger = new Logger(PromptBuilderV2Service.name);

  buildPrompt(context: PromptBuilderContext): PromptResult {
    const system = this.getSystemPromptForLanguage(context.language);
    const templateContext = this.buildTemplateContext(context.templates);
    const user = this.buildUserPrompt(context);

    const systemTokens = Math.ceil(system.length / 4);
    const templateTokens = Math.ceil(templateContext.length / 4);
    const userTokens = Math.ceil(user.length / 4);
    const totalTokens = systemTokens + templateTokens + userTokens;

    this.logger.debug(
      `Built prompt: system=${systemTokens}t, templates=${templateTokens}t, user=${userTokens}t, total=${totalTokens}t`,
    );

    return {
      system: `${system}\n\n${templateContext}`,
      user,
      metadata: {
        tokenEstimate: totalTokens,
        templateCount: context.templates.length,
      },
    };
  }

  buildCacheKey(context: PromptBuilderContext): string {
    const roundedCalories = Math.round(context.remaining.calories / 100) * 100;
    const dietaryHash =
      context.dietaryRestrictions && context.dietaryRestrictions.length > 0
        ? crypto
            .createHash('md5')
            .update(context.dietaryRestrictions.sort().join(','))
            .digest('hex')
            .substring(0, 8)
        : 'none';

    return `ai:templates:${context.language}:${context.category}:${roundedCalories}:${dietaryHash}`;
  }

  private getSystemPromptForLanguage(language: string): string {
    const prompts: Record<string, string> = {
      en: `You are a meal selection assistant. Your ONLY job is to pick template indices and scaling factors.

You must respond in valid JSON format.

Rules:
1. Select exactly 3 templates from the provided list
2. Return ONLY template indices (0-based) and scaling factors (0.7-1.3)
3. DO NOT generate macros - backend will calculate them
4. Response format (JSON): {"templateIndices": [0,1,2], "scalingFactors": [1.0, 0.95, 1.05]}`,

      pl: `Jesteś asystentem wyboru posiłków. Twoim JEDYNYM zadaniem jest wybranie indeksów szablonów i współczynników skalowania.

Musisz odpowiedzieć w prawidłowym formacie JSON.

Zasady:
1. Wybierz dokładnie 3 szablony z dostarczonej listy
2. Zwróć TYLKO indeksy szablonów (0-based) i współczynniki skalowania (0.7-1.3)
3. NIE generuj makr - backend je obliczy
4. Format odpowiedzi (JSON): {"templateIndices": [0,1,2], "scalingFactors": [1.0, 0.95, 1.05]}`,
    };

    return prompts[language] ?? prompts.en;
  }

  private buildTemplateContext(templates: MealTemplate[]): string {
    const templateList = templates.map((t, index) => ({
      index,
      name: t.name,
      baseCalories: Math.round(t.totalCalories),
    }));

    return `Available templates:\n${JSON.stringify(templateList, null, 0)}`;
  }

  private buildUserPrompt(context: PromptBuilderContext): string {
    const parts: string[] = [];

    parts.push(`Target: ${Math.round(context.remaining.calories)} kcal`);
    parts.push(`Pick ${context.count}. Scale 0.7-1.3`);

    if (context.dietaryRestrictions && context.dietaryRestrictions.length > 0) {
      parts.push(`Restrictions: ${context.dietaryRestrictions.join(', ')}`);
    }

    return parts.join('\n');
  }
}
