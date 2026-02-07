import { test, expect } from '@playwright/test';

import { registerAndLogin } from './utils/auth';

test.describe('Exercises flow', () => {
  test('search shows empty state for unknown term', async ({ page }) => {
    await registerAndLogin(page, 'exercises');

    await page.goto('/pl/exercises');

    await page
      .getByPlaceholder('Szukaj ćwiczeń po nazwie...')
      .fill('zzzxqy-not-found');

    await expect(page.getByText('Nie znaleziono ćwiczeń')).toBeVisible({
      timeout: 10000,
    });
    await expect(
      page.getByText('Spróbuj innego filtra lub wyszukiwania'),
    ).toBeVisible();
  });
});
