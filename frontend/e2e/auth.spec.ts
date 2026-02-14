import { test, expect } from '@playwright/test';

const TEST_USER = {
  firstName: 'Test',
  lastName: 'User',
  email: `test+${Date.now()}@example.com`,
  password: 'TestPassword123!',
};

test.describe('Auth flow', () => {
  test('register → login → redirected to login', async ({ page }) => {
    await page.goto('/pl/register');

    await page.locator('input[name="email"]').fill(TEST_USER.email);
    await page.locator('input[name="password"]').fill(TEST_USER.password);
    await page
      .locator('input[name="confirmPassword"]')
      .fill(TEST_USER.password);
    await page.locator('input[name="firstName"]').fill(TEST_USER.firstName);
    await page.locator('input[name="lastName"]').fill(TEST_USER.lastName);

    await page.getByRole('button', { name: 'Zarejestruj' }).click();

    await expect(page).toHaveURL(/\/pl\/login/, { timeout: 10000 });

    await page.locator('input[name="email"]').fill(TEST_USER.email);
    await page.locator('input[name="password"]').fill(TEST_USER.password);

    await page.locator('form').getByRole('button', { name: 'Zaloguj' }).click();

    await expect(page).toHaveURL(/\/pl\/welcome/, { timeout: 10000 });
  });

  test('login with invalid credentials shows error', async ({ page }) => {
    await page.goto('/pl/login');

    await page.locator('input[name="email"]').fill('nonexistent@example.com');
    await page.locator('input[name="password"]').fill('wrongpassword');

    await page.locator('form').getByRole('button', { name: 'Zaloguj' }).click();

    await expect(page.getByText('Niepoprawne dane logowania')).toBeVisible({
      timeout: 10000,
    });
  });
  test('login with missing password shows validation error', async ({
    page,
  }) => {
    await page.goto('/pl/login');

    await page.locator('input[name="email"]').fill('test@example.com');

    await page.locator('form').getByRole('button', { name: 'Zaloguj' }).click();

    await expect(
      page.getByText('Too small: expected string to have >=8 characters'),
    ).toBeVisible({
      timeout: 5000,
    });
    await expect(page).toHaveURL(/\/pl\/login/);
  });
});
