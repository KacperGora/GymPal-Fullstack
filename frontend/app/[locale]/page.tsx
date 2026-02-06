import { getTranslations } from 'next-intl/server';

import type { Metadata } from 'next';

import { routing } from '@/i18n/routing';

import {
  LandingCta,
  LandingFooter,
  LandingHero,
  LandingShell,
  NutritionSection,
  ProofHighlights,
  ProofMetrics,
  SyncPanel,
} from './components/landing';

const BASE_URL = 'https://gympal.app';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'landing' });

  const title = `GymPal – ${t('hero.title')}`;
  const description = t('hero.subtitle');

  const alternateLanguages = Object.fromEntries(
    routing.locales.map((l) => [l, `${BASE_URL}/${l}`]),
  );

  return {
    title,
    description,
    alternates: {
      canonical: `${BASE_URL}/${locale}`,
      languages: alternateLanguages,
    },
    openGraph: {
      title,
      description,
      url: `${BASE_URL}/${locale}`,
      siteName: 'GymPal',
      locale,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

export default function Home() {
  return (
    <LandingShell>
      <LandingHero />
      <NutritionSection />
      <SyncPanel />
      <ProofHighlights />
      <ProofMetrics />
      <LandingCta />
      <LandingFooter />
    </LandingShell>
  );
}
