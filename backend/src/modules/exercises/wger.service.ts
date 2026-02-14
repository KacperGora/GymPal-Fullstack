import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import type {
  WgerExercise,
  WgerCategory,
  WgerMuscle,
  WgerEquipment,
  WgerPaginated,
} from '@gympal/shared';

const WGER_BASE = 'https://wger.de/api/v2';

interface WgerRawMuscle {
  id: number;
  name: string;
  name_en: string;
  is_front: boolean;
}

interface WgerRawImage {
  id: number;
  image: string;
  is_main: boolean;
}

interface WgerRawTranslation {
  id: number;
  name: string;
  description: string;
  language: number;
}

interface WgerRawExercise {
  id: number;
  category: { id: number; name: string };
  muscles: WgerRawMuscle[];
  muscles_secondary: WgerRawMuscle[];
  equipment: { id: number; name: string }[];
  images: WgerRawImage[];
  translations: WgerRawTranslation[];
}

interface WgerRawPaginated<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

interface CacheEntry<T> {
  data: T;
  expiry: number;
}

const LANG_EN = 2;

const LOCALE_TO_WGER_LANG: Record<string, number> = {
  en: 2,
  de: 1,
  pl: 14,
  es: 4,
  fr: 12,
  it: 13,
  pt: 7,
  nl: 6,
  ru: 5,
  cs: 9,
  sv: 10,
  no: 11,
  uk: 15,
  tr: 16,
  bg: 3,
};

const LOCALE_TO_SEARCH_LANG: Record<string, string> = {
  en: 'english',
  de: 'german',
  pl: 'polish',
  es: 'spanish',
  fr: 'french',
  it: 'italian',
  pt: 'portuguese',
  nl: 'dutch',
  ru: 'russian',
  cs: 'czech',
  sv: 'swedish',
  no: 'norwegian',
  uk: 'ukrainian',
  tr: 'turkish',
  bg: 'bulgarian',
};

@Injectable()
export class WgerService {
  private readonly logger = new Logger(WgerService.name);
  private readonly cache = new Map<string, CacheEntry<unknown>>();
  private readonly cacheTTL = 1000 * 60 * 60;
  private readonly staticCacheTTL = 1000 * 60 * 60 * 24;
  private readonly maxCacheSize = 1000;
  private readonly batchSize = 10;
  private readonly batchDelayMs = 100;

  private getCached<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (entry && entry.expiry > Date.now()) {
      return entry.data as T;
    }
    if (entry) {
      this.cache.delete(key);
    }
    return null;
  }

  private setCache<T>(key: string, data: T, ttl?: number): void {
    if (this.cache.size >= this.maxCacheSize) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {
        this.cache.delete(firstKey);
      }
    }
    this.cache.set(key, { data, expiry: Date.now() + (ttl ?? this.cacheTTL) });
  }

  private async batchPromises<T, R>(
    items: T[],
    fn: (item: T) => Promise<R>,
    batchSize: number = this.batchSize,
    delayMs: number = this.batchDelayMs,
  ): Promise<R[]> {
    const results: R[] = [];
    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize);
      const batchResults = await Promise.all(batch.map(fn));
      results.push(...batchResults);
      if (i + batchSize < items.length) {
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }
    return results;
  }

  private async fetchJson<T>(url: string): Promise<T> {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new HttpException(
          `Wger API error: ${response.statusText}`,
          response.status,
        );
      }
      return (await response.json()) as T;
    } catch (error) {
      this.logger.error(`Failed to fetch from Wger: ${url}`, error);
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        'Failed to fetch exercises from Wger API',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }

  private resolveWgerLangId(lang?: string): number {
    if (lang && lang in LOCALE_TO_WGER_LANG) {
      return LOCALE_TO_WGER_LANG[lang];
    }
    return LANG_EN;
  }

  private transformExercise(
    raw: WgerRawExercise,
    langId: number = LANG_EN,
  ): WgerExercise {
    const translation =
      raw.translations.find((t) => t.language === langId) ??
      raw.translations.find((t) => t.language === LANG_EN) ??
      raw.translations[0];

    return {
      id: raw.id,
      name: translation?.name ?? 'Unknown',
      description: (translation?.description ?? '').replace(/<[^>]*>/g, ''),
      category: raw.category.name,
      categoryId: raw.category.id,
      muscles: raw.muscles.map((m) => m.name_en || m.name),
      musclesSecondary: raw.muscles_secondary.map((m) => m.name_en || m.name),
      equipment: raw.equipment.map((e) => e.name),
      images: raw.images
        .sort((a, b) => (b.is_main ? 1 : 0) - (a.is_main ? 1 : 0))
        .map((img) =>
          img.image.startsWith('http')
            ? img.image
            : `https://wger.de${img.image}`,
        ),
    };
  }

  async fetchExercises(
    limit = 20,
    offset = 0,
    lang?: string,
  ): Promise<WgerPaginated> {
    const langId = this.resolveWgerLangId(lang);
    const cacheKey = `exercises:${langId}:${limit}:${offset}`;
    const cached = this.getCached<WgerPaginated>(cacheKey);
    if (cached) return cached;

    const url = `${WGER_BASE}/exerciseinfo/?format=json&language=${LANG_EN}&limit=${limit}&offset=${offset}`;
    const raw = await this.fetchJson<WgerRawPaginated<WgerRawExercise>>(url);

    const result: WgerPaginated = {
      count: raw.count,
      next: raw.next,
      previous: raw.previous,
      results: raw.results.map((e) => this.transformExercise(e, langId)),
    };

    this.setCache(cacheKey, result);
    return result;
  }

  async fetchExerciseById(id: number, lang?: string): Promise<WgerExercise> {
    const langId = this.resolveWgerLangId(lang);
    const cacheKey = `exercise:${langId}:${id}`;
    const cached = this.getCached<WgerExercise>(cacheKey);
    if (cached) return cached;

    const url = `${WGER_BASE}/exerciseinfo/${id}/?format=json`;
    const raw = await this.fetchJson<WgerRawExercise>(url);
    const result = this.transformExercise(raw, langId);

    this.setCache(cacheKey, result);
    return result;
  }

  async fetchExercisesByCategory(
    categoryId: number,
    limit = 20,
    offset = 0,
    lang?: string,
  ): Promise<WgerPaginated> {
    const langId = this.resolveWgerLangId(lang);
    const cacheKey = `category:${langId}:${categoryId}:${limit}:${offset}`;
    const cached = this.getCached<WgerPaginated>(cacheKey);
    if (cached) return cached;

    const url = `${WGER_BASE}/exerciseinfo/?format=json&language=${LANG_EN}&category=${categoryId}&limit=${limit}&offset=${offset}`;
    const raw = await this.fetchJson<WgerRawPaginated<WgerRawExercise>>(url);

    const result: WgerPaginated = {
      count: raw.count,
      next: raw.next,
      previous: raw.previous,
      results: raw.results.map((e) => this.transformExercise(e, langId)),
    };

    this.setCache(cacheKey, result);
    return result;
  }

  async fetchExercisesByMuscle(
    muscleId: number,
    limit = 20,
    offset = 0,
    lang?: string,
  ): Promise<WgerPaginated> {
    const langId = this.resolveWgerLangId(lang);
    const cacheKey = `muscle:${langId}:${muscleId}:${limit}:${offset}`;
    const cached = this.getCached<WgerPaginated>(cacheKey);
    if (cached) return cached;

    const url = `${WGER_BASE}/exerciseinfo/?format=json&language=${LANG_EN}&muscles=${muscleId}&limit=${limit}&offset=${offset}`;
    const raw = await this.fetchJson<WgerRawPaginated<WgerRawExercise>>(url);

    const result: WgerPaginated = {
      count: raw.count,
      next: raw.next,
      previous: raw.previous,
      results: raw.results.map((e) => this.transformExercise(e, langId)),
    };

    this.setCache(cacheKey, result);
    return result;
  }

  async fetchExercisesByEquipment(
    equipmentId: number,
    limit = 20,
    offset = 0,
    lang?: string,
  ): Promise<WgerPaginated> {
    const langId = this.resolveWgerLangId(lang);
    const cacheKey = `equipment:${langId}:${equipmentId}:${limit}:${offset}`;
    const cached = this.getCached<WgerPaginated>(cacheKey);
    if (cached) return cached;

    const url = `${WGER_BASE}/exerciseinfo/?format=json&language=${LANG_EN}&equipment=${equipmentId}&limit=${limit}&offset=${offset}`;
    const raw = await this.fetchJson<WgerRawPaginated<WgerRawExercise>>(url);

    const result: WgerPaginated = {
      count: raw.count,
      next: raw.next,
      previous: raw.previous,
      results: raw.results.map((e) => this.transformExercise(e, langId)),
    };

    this.setCache(cacheKey, result);
    return result;
  }

  async searchExercises(
    term: string,
    limit = 20,
    lang?: string,
  ): Promise<WgerExercise[]> {
    const searchLang = (lang && LOCALE_TO_SEARCH_LANG[lang]) ?? 'english';
    const cacheKey = `search:${searchLang}:${term}:${limit}`;
    const cached = this.getCached<WgerExercise[]>(cacheKey);
    if (cached) return cached;

    const url = `${WGER_BASE}/exercise/search/?term=${encodeURIComponent(term)}&language=${searchLang}&format=json`;
    const raw = await this.fetchJson<{
      suggestions: {
        data: {
          id: number;
          base_id: number;
          name: string;
          category: string;
          image: string | null;
          image_thumbnail: string | null;
        };
      }[];
    }>(url);

    const ids = raw.suggestions.slice(0, limit).map((s) => s.data.base_id);

    const results = await this.batchPromises(ids, (id) =>
      this.fetchExerciseById(id, lang).catch(() => null),
    );

    const filtered = results.filter((r): r is WgerExercise => r !== null);
    this.setCache(cacheKey, filtered);
    return filtered;
  }

  async fetchCategories(): Promise<WgerCategory[]> {
    const cacheKey = 'categories';
    const cached = this.getCached<WgerCategory[]>(cacheKey);
    if (cached) return cached;

    const url = `${WGER_BASE}/exercisecategory/?format=json`;
    const raw =
      await this.fetchJson<WgerRawPaginated<{ id: number; name: string }>>(url);
    const result = raw.results.map((c) => ({ id: c.id, name: c.name }));

    this.setCache(cacheKey, result, this.staticCacheTTL);
    return result;
  }

  async fetchMuscles(): Promise<WgerMuscle[]> {
    const cacheKey = 'muscles';
    const cached = this.getCached<WgerMuscle[]>(cacheKey);
    if (cached) return cached;

    const url = `${WGER_BASE}/muscle/?format=json`;
    const raw = await this.fetchJson<WgerRawPaginated<WgerRawMuscle>>(url);
    const result: WgerMuscle[] = raw.results.map((m) => ({
      id: m.id,
      name: m.name,
      nameEn: m.name_en || m.name,
      isFront: m.is_front,
    }));

    this.setCache(cacheKey, result, this.staticCacheTTL);
    return result;
  }

  async fetchEquipment(): Promise<WgerEquipment[]> {
    const cacheKey = 'equipment';
    const cached = this.getCached<WgerEquipment[]>(cacheKey);
    if (cached) return cached;

    const url = `${WGER_BASE}/equipment/?format=json`;
    const raw =
      await this.fetchJson<WgerRawPaginated<{ id: number; name: string }>>(url);
    const result = raw.results.map((e) => ({ id: e.id, name: e.name }));

    this.setCache(cacheKey, result, this.staticCacheTTL);
    return result;
  }
}
