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

const MOCK_MEALS = [
  {
    id: 'meal-1',
    name: 'Owsianka',
    calories: 350,
    proteins: 12,
    carbs: 60,
    fats: 5,
    category: 'BREAKFAST',
    date: new Date().toISOString(),
  },
];

const mockDashboardApis = async (
  page: import('@playwright/test').Page,
  options: { meals?: unknown[]; glasses?: number } = {},
) => {
  const { meals = [], glasses = 0 } = options;

  await page.route('**/auth/me**', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        id: 'test-user-id',
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        hasProfile: true,
      }),
    }),
  );
  await page.route('**/meals**', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(meals),
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
  await page.route('**/workouts/stats/weekly**', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([]),
    }),
  );
};

test.describe('Dashboard page', () => {
  test('renders greeting and subtitle', async ({ page }) => {
    await registerAndLogin(page, 'dashboard-greeting');
    await mockDashboardApis(page);

    await page.goto('/pl/dashboard');

    await expect(page.getByText(/Cześć/i)).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('Twój dzienny przegląd')).toBeVisible();
  });

  test('shows calorie card with target from TDEE', async ({ page }) => {
    await registerAndLogin(page, 'dashboard-calories');
    await mockDashboardApis(page);

    await page.goto('/pl/dashboard');

    await expect(page.getByText('2200 kcal pozostało')).toBeVisible({
      timeout: 10000,
    });
  });

  test('shows consumed calories when meals are loaded', async ({ page }) => {
    await registerAndLogin(page, 'dashboard-consumed');
    await mockDashboardApis(page, { meals: MOCK_MEALS });

    await page.goto('/pl/dashboard');

    // 350 kcal consumed from mock meal
    await expect(page.getByText('350')).toBeVisible({ timeout: 10000 });
  });

  test('shows water card with glass count', async ({ page }) => {
    await registerAndLogin(page, 'dashboard-water');
    await mockDashboardApis(page, { glasses: 4 });

    await page.goto('/pl/dashboard');

    await expect(page.getByText('Nawodnienie')).toBeVisible({
      timeout: 10000,
    });
    await expect(page.getByRole('heading', { name: '4' })).toBeVisible();
  });

  test('shows macros section', async ({ page }) => {
    await registerAndLogin(page, 'dashboard-macros');
    await mockDashboardApis(page, { meals: MOCK_MEALS });

    await page.goto('/pl/dashboard');

    await expect(page.getByText('Makro', { exact: true })).toBeVisible({
      timeout: 10000,
    });
  });

  test('shows workout frequency chart section', async ({ page }) => {
    await registerAndLogin(page, 'dashboard-workouts');
    await mockDashboardApis(page);

    await page.goto('/pl/dashboard');

    await expect(page.getByText('Częstotliwość treningów')).toBeVisible({
      timeout: 10000,
    });
  });

  test('shows weekly summary chart section', async ({ page }) => {
    await registerAndLogin(page, 'dashboard-weekly');
    await mockDashboardApis(page);

    await page.goto('/pl/dashboard');

    await expect(page.getByText('Ostatnie 7 dni')).toBeVisible({
      timeout: 10000,
    });
  });
});
