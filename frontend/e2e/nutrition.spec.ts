import { expect, test } from '@playwright/test';

import { registerAndLogin } from './utils/auth';

const MOCK_TDEE = {
  tdee: 2500,
  bmr: 1900,
  targetCalories: 2200,
  targetProteins: 165,
  targetCarbs: 220,
  targetFats: 73,
  goal: 'MAINTAIN',
};

const MOCK_MEAL = {
  id: 'meal-1',
  name: 'Kurczak z ryżem',
  calories: 500,
  proteins: 40,
  carbs: 45,
  fats: 10,
  category: 'LUNCH',
  date: new Date().toISOString(),
};

const mockBaseApis = async (
  page: import('@playwright/test').Page,
  meals: unknown[] = [],
  glasses = 0,
) => {
  await page.route('**/meals**', (route) => {
    if (route.request().method() === 'GET') {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(meals),
      });
      return;
    }
    route.fulfill({
      status: 201,
      contentType: 'application/json',
      body: JSON.stringify(MOCK_MEAL),
    });
  });
  await page.route('**/meals/recent**', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([]),
    }),
  );
  await page.route('**/nutrition/tdee**', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(MOCK_TDEE),
    }),
  );
  await page.route('**/nutrition/weekly-stats**', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([]),
    }),
  );
  await page.route('**/water**', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ glasses }),
    }),
  );
};

test.describe('Nutrition page', () => {
  test('loads and shows "Dodaj posiłek" button with empty meal list', async ({
    page,
  }) => {
    await registerAndLogin(page, 'nutrition-empty');
    await mockBaseApis(page, []);

    await page.goto('/pl/nutrition');

    await expect(
      page.getByRole('button', { name: 'Dodaj posiłek' }),
    ).toBeVisible({ timeout: 10000 });
  });

  test('shows today label in day navigation', async ({ page }) => {
    await registerAndLogin(page, 'nutrition-today');
    await mockBaseApis(page, []);

    await page.goto('/pl/nutrition');

    await expect(page.getByText('Dziś')).toBeVisible({ timeout: 10000 });
  });

  test('shows existing meal name and calories', async ({ page }) => {
    await registerAndLogin(page, 'nutrition-meals');
    await mockBaseApis(page, [MOCK_MEAL]);

    await page.goto('/pl/nutrition');

    await expect(
      page.getByText('Kurczak z ryżem', { exact: true }),
    ).toBeVisible({
      timeout: 10000,
    });
    await expect(page.getByText('500 kcal')).toBeVisible();
  });

  test('opens add meal modal on button click', async ({ page }) => {
    await registerAndLogin(page, 'nutrition-modal');
    await mockBaseApis(page, []);

    await page.goto('/pl/nutrition');

    await page.getByRole('button', { name: 'Dodaj posiłek' }).click();

    await expect(page.getByRole('dialog')).toBeVisible({ timeout: 5000 });
    await expect(
      page.getByRole('dialog').getByText('Dodaj posiłek'),
    ).toBeVisible();
  });

  test('submits add meal form and closes modal', async ({ page }) => {
    await registerAndLogin(page, 'nutrition-submit');
    await mockBaseApis(page, []);

    await page.goto('/pl/nutrition');

    await page.getByRole('button', { name: 'Dodaj posiłek' }).click();
    await expect(page.getByRole('dialog')).toBeVisible({ timeout: 5000 });

    await page.getByRole('dialog').getByLabel('Nazwa posiłku').fill('Owsianka');
    await page.getByRole('dialog').getByLabel('Kalorie').fill('350');

    await page
      .getByRole('dialog')
      .getByRole('button', { name: 'Dodaj' })
      .click();

    await expect(page.getByRole('dialog')).not.toBeVisible({ timeout: 5000 });
  });

  test('cancel button closes add meal modal without submitting', async ({
    page,
  }) => {
    await registerAndLogin(page, 'nutrition-cancel');
    await mockBaseApis(page, []);

    await page.goto('/pl/nutrition');

    await page.getByRole('button', { name: 'Dodaj posiłek' }).click();
    await expect(page.getByRole('dialog')).toBeVisible({ timeout: 5000 });

    await page
      .getByRole('dialog')
      .getByRole('button', { name: 'Anuluj' })
      .click();

    await expect(page.getByRole('dialog')).not.toBeVisible({ timeout: 5000 });
  });

  test('water card shows glass count', async ({ page }) => {
    await registerAndLogin(page, 'nutrition-water');
    await mockBaseApis(page, [], 3);

    await page.goto('/pl/nutrition');

    await expect(page.getByText('Nawodnienie')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('3')).toBeVisible();
  });

  test('navigates to previous day when left arrow clicked', async ({
    page,
  }) => {
    await registerAndLogin(page, 'nutrition-prev-day');
    await mockBaseApis(page, []);

    await page.goto('/pl/nutrition');

    await expect(page.getByText('Dziś')).toBeVisible({ timeout: 10000 });

    // Click the left chevron (previous day)
    await page.locator('[data-testid="ChevronLeftIcon"]').locator('..').click();

    await expect(page.getByText('Wczoraj')).toBeVisible({ timeout: 3000 });
  });
});
