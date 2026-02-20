import { Injectable, Logger } from '@nestjs/common';
import { MealCategory } from '../../generated/prisma/enums';
import type { MealTemplate } from '../../modules/ai/template.service';

interface CacheEntry<T> {
  data: T;
  expiry: number;
}

interface CacheStats {
  hits: number;
  misses: number;
  hitRate: number;
}

export interface MacroData {
  calories: number;
  proteins: number;
  carbs: number;
  fats: number;
}

@Injectable()
export class CacheService {
  private readonly logger = new Logger(CacheService.name);
  private readonly templateCache = new Map<
    string,
    CacheEntry<MealTemplate[]>
  >();
  private readonly ingredientCache = new Map<string, MacroData>();
  private readonly templateTTL = 1000 * 60 * 60 * 24; // 24h

  private stats = {
    hits: 0,
    misses: 0,
  };

  getTemplates(
    language: string,
    category: MealCategory,
    targetCalories: number,
  ): Promise<MealTemplate[] | null> {
    const roundedCalories = Math.round(targetCalories / 100) * 100;
    const key = `templates:${language}:${category}:${roundedCalories}`;

    const cached = this.templateCache.get(key);
    if (cached && cached.expiry > Date.now()) {
      this.stats.hits++;
      this.logger.debug(`Cache HIT for key: ${key}`);
      return Promise.resolve(cached.data);
    }

    if (cached) {
      this.templateCache.delete(key);
    }

    this.stats.misses++;
    this.logger.debug(`Cache MISS for key: ${key}`);
    return Promise.resolve(null);
  }

  setTemplates(
    language: string,
    category: MealCategory,
    targetCalories: number,
    templates: MealTemplate[],
  ): Promise<void> {
    const roundedCalories = Math.round(targetCalories / 100) * 100;
    const key = `templates:${language}:${category}:${roundedCalories}`;

    this.templateCache.set(key, {
      data: templates,
      expiry: Date.now() + this.templateTTL,
    });

    this.logger.debug(
      `Cached templates for key: ${key} (${templates.length} templates)`,
    );

    return Promise.resolve();
  }

  getIngredientMacros(
    ingredientId: string,
    grams: number,
  ): Promise<MacroData | null> {
    const cached = this.ingredientCache.get(ingredientId);
    if (cached) {
      this.stats.hits++;
      this.logger.debug(`Cache HIT for ingredient: ${ingredientId}`);

      const scaleFactor = grams / 100;
      return Promise.resolve({
        calories: Math.round(cached.calories * scaleFactor),
        proteins: Math.round(cached.proteins * scaleFactor * 10) / 10,
        carbs: Math.round(cached.carbs * scaleFactor * 10) / 10,
        fats: Math.round(cached.fats * scaleFactor * 10) / 10,
      });
    }

    this.stats.misses++;
    this.logger.debug(`Cache MISS for ingredient: ${ingredientId}`);
    return Promise.resolve(null);
  }

  setIngredientMacros(ingredientId: string, macros: MacroData): Promise<void> {
    this.ingredientCache.set(ingredientId, macros);
    this.logger.debug(`Cached ingredient macros for: ${ingredientId}`);
    return Promise.resolve();
  }

  invalidateTemplates(category?: MealCategory): Promise<void> {
    if (category) {
      const keysToDelete: string[] = [];
      for (const key of this.templateCache.keys()) {
        if (key.includes(`:${category}:`)) {
          keysToDelete.push(key);
        }
      }

      for (const key of keysToDelete) {
        this.templateCache.delete(key);
      }

      this.logger.log(
        `Invalidated ${keysToDelete.length} template cache entries for category: ${category}`,
      );
    } else {
      this.templateCache.clear();
      this.logger.log('Invalidated all template cache entries');
    }

    return Promise.resolve();
  }

  invalidateIngredient(ingredientId: string): Promise<void> {
    this.ingredientCache.delete(ingredientId);
    this.logger.log(`Invalidated ingredient cache for: ${ingredientId}`);
    return Promise.resolve();
  }

  getCacheStats(): Promise<CacheStats> {
    const total = this.stats.hits + this.stats.misses;
    const hitRate = total > 0 ? this.stats.hits / total : 0;

    return Promise.resolve({
      hits: this.stats.hits,
      misses: this.stats.misses,
      hitRate: Math.round(hitRate * 10000) / 100,
    });
  }
}
