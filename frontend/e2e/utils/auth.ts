import { expect, type Page } from '@playwright/test';

export const loginAsTrainer = async (page: Page) => {
  await page.route('**/auth/me**', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        id: 1,
        firstName: 'John',
        lastName: 'Coach',
        email: 'trainer@gympal.app',
        role: 'TRAINER',
        hasProfile: true,
      }),
    }),
  );
  await page.goto('/pl/login');
  await page.locator('input[name="email"]').fill('trainer@gympal.app');
  await page.locator('input[name="password"]').fill('Trainer123!');
  await page.locator('form').getByRole('button', { name: 'Zaloguj' }).click();
  await expect(page).toHaveURL(/\/pl\/trainer\/dashboard/, { timeout: 10000 });
};

export const loginAsClient = async (page: Page) => {
  await page.route('**/auth/me**', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        id: 1,
        firstName: 'John',
        lastName: 'client',
        email: 'client1@gympal.app',
        role: 'CLIENT',
        hasProfile: true,
      }),
    }),
  );
  await page.goto('/pl/login');
  await page.locator('input[name="email"]').fill('client1@gympal.app');
  await page.locator('input[name="password"]').fill('Client123!');
  await page.locator('form').getByRole('button', { name: 'Zaloguj' }).click();
  await expect(page).toHaveURL(/\/pl\/dashboard/, { timeout: 10000 });
};

export const createTestUser = (prefix: string = 'test') => ({
  firstName: 'Test',
  lastName: 'User',
  email: `${prefix}+${crypto.randomUUID()}@example.com`,
  password: 'TestPassword123!',
});

export const registerAndLogin = async (page: Page, prefix?: string) => {
  const user = createTestUser(prefix);

  await page.goto('/pl/register');
  await page.locator('input[name="email"]').fill(user.email);
  await page.locator('input[name="password"]').fill(user.password);
  await page.locator('input[name="confirmPassword"]').fill(user.password);
  await page.locator('input[name="firstName"]').fill(user.firstName);
  await page.locator('input[name="lastName"]').fill(user.lastName);
  await page.getByRole('button', { name: 'Zarejestruj' }).click();

  await expect(page).toHaveURL(/\/pl\/login/, { timeout: 10000 });

  await page.locator('input[name="email"]').fill(user.email);
  await page.locator('input[name="password"]').fill(user.password);
  await page.locator('form').getByRole('button', { name: 'Zaloguj' }).click();

  await expect(page).toHaveURL(/\/pl\/welcome/, { timeout: 10000 });

  return user;
};
