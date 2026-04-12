import { Injectable, Logger } from '@nestjs/common';

const USDA_BASE = 'https://api.nal.usda.gov/fdc/v1';

/** Nutrient IDs used by USDA FoodData Central */
const NUTRIENT_ENERGY = 1008;
const NUTRIENT_PROTEIN = 1003;
const NUTRIENT_CARBS = 1005;
const NUTRIENT_FAT = 1004;
const NUTRIENT_FIBER = 1079;

export interface UsdaMacros {
  calories: number;
  proteins: number;
  carbs: number;
  fats: number;
  fiber: number;
  fdcId: number;
  description: string;
}

interface UsdaNutrient {
  nutrientId: number;
  value: number;
}

interface UsdaFood {
  fdcId: number;
  description: string;
  dataType: string;
  foodNutrients: UsdaNutrient[];
}

interface UsdaSearchResponse {
  foods: UsdaFood[];
}

@Injectable()
export class UsdaApiService {
  private readonly logger = new Logger(UsdaApiService.name);
  private readonly apiKey: string;

  constructor() {
    const key = process.env.USDA_API_KEY;
    if (!key) {
      this.logger.warn('USDA_API_KEY not set — ingredient seeding unavailable');
    }
    this.apiKey = key ?? '';
  }

  async searchFood(
    query: string,
    dataTypes: string[] = ['Foundation', 'SR Legacy'],
  ): Promise<UsdaMacros | null> {
    if (!this.apiKey) {
      throw new Error('USDA_API_KEY is not configured');
    }

    const params = new URLSearchParams({
      query,
      api_key: this.apiKey,
      dataType: dataTypes.join(','),
      pageSize: '5',
    });

    const url = `${USDA_BASE}/foods/search?${params.toString()}`;
    this.logger.debug(`USDA search: "${query}"`);

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(
        `USDA API error: ${response.status} ${response.statusText}`,
      );
    }

    const body = (await response.json()) as UsdaSearchResponse;

    if (!body.foods?.length) {
      this.logger.warn(`USDA: no results for "${query}"`);
      return null;
    }

    const food = body.foods[0];
    this.logger.debug(
      `USDA match: "${food.description}" (fdcId=${food.fdcId})`,
    );

    return this.extractMacros(food);
  }

  private extractMacros(food: UsdaFood): UsdaMacros {
    const get = (id: number) =>
      food.foodNutrients.find((n) => n.nutrientId === id)?.value ?? 0;

    return {
      fdcId: food.fdcId,
      description: food.description,
      calories: Math.round(get(NUTRIENT_ENERGY)),
      proteins: Math.round(get(NUTRIENT_PROTEIN) * 10) / 10,
      carbs: Math.round(get(NUTRIENT_CARBS) * 10) / 10,
      fats: Math.round(get(NUTRIENT_FAT) * 10) / 10,
      fiber: Math.round(get(NUTRIENT_FIBER) * 10) / 10,
    };
  }
}
