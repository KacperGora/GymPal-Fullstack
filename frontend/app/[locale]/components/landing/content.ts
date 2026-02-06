type Translator = {
  (key: string): string;
  raw: (key: string) => unknown;
};

type Stat = { label: string; value: string };
type Card = { title: string; text: string };
type WorkoutRow = { name: string; sets: string };
type FooterColumn = { title: string; items: string[] };

export const getHeroStats = (t: Translator) => t.raw('hero.stats') as Stat[];

export const getWorkoutRows = (t: Translator) =>
  t.raw('workout.rows') as WorkoutRow[];

export const getFeatureCards = (t: Translator) =>
  t.raw('features.cards') as Card[];

export const getNutritionStats = (t: Translator) =>
  t.raw('nutrition.stats') as Stat[];

export const getNutritionCards = (t: Translator) =>
  t.raw('nutrition.cards') as Card[];

export const getProofHighlights = (t: Translator) =>
  t.raw('proofHighlights.cards') as Card[];

export const getProofMetrics = (t: Translator) =>
  t.raw('proofMetrics.metrics') as Stat[];

export const getFooterColumns = (t: Translator) =>
  t.raw('footer.columns') as FooterColumn[];
