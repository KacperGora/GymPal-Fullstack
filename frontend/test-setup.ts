import '@testing-library/jest-dom/vitest';
import React from 'react';
import { vi } from 'vitest';

// Mock next-intl
vi.mock('next-intl', () => ({
  useTranslations: () => {
    return (key: string, params?: Record<string, unknown>) => {
      // If params are provided, append them to the key for testing purposes
      if (params && Object.keys(params).length > 0) {
        const paramsStr = Object.entries(params)
          .map(([k, v]) => `${v}`)
          .join(' ');
        return `${key} ${paramsStr}`;
      }
      return key;
    };
  },
}));

// Mock @/i18n/navigation
vi.mock('@/i18n/navigation', () => ({
  Link: ({
    href,
    children,
    ...props
  }: React.AnchorHTMLAttributes<HTMLAnchorElement>) =>
    React.createElement('a', { href, ...props }, children),
}));
