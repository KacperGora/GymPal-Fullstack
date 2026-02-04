import { notFound } from 'next/navigation';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';

import type { Metadata } from 'next';

import { Navbar } from '@/shared/components/navbar/Navbar';

import { routing } from '@/i18n/routing';
import ThemeRegistry from '@/shared/theme/ThemeRegistry';

import './globals.css';
import { Providers } from './providers';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export const metadata: Metadata = {
  title: 'GymPal',
  description: 'Your fitness companion',
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as 'pl' | 'en')) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body>
        <ThemeRegistry>
          <NextIntlClientProvider locale={locale} messages={messages}>
            <Providers>
              <Navbar />
              {children}
            </Providers>
          </NextIntlClientProvider>
        </ThemeRegistry>
      </body>
    </html>
  );
}
