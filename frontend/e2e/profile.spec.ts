import { expect, test } from '@playwright/test';

const createTestUser = () => ({
  firstName: 'Test',
  lastName: 'User',
  email: `profile+${Date.now()}@example.com`,
  password: 'TestPassword123!',
});

test.describe('Profile flow', () => {
  test('register → login → complete profile → logout', async ({ page }) => {
    const user = createTestUser();

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

    await page.getByLabel('Wzrost (cm)').fill('180');
    await page.getByLabel('Waga (kg)').fill('80');
    await page.getByLabel('Wiek').fill('32');

    await page.getByLabel('Poziom aktywności').click();
    await page
      .getByRole('option', {
        name: 'Umiarkowana aktywność (3-5 dni/tydzień)',
      })
      .click();

    await page.getByLabel('Cel').click();
    await page.getByRole('option', { name: 'Utrzymanie wagi' }).click();

    await page.getByRole('button', { name: 'Zapisz' }).click();

    await expect(page).toHaveURL(/\/pl\/dashboard/, { timeout: 10000 });
    await page.goto('/pl/profile');
    await expect(page.getByRole('heading', { name: 'Profil' })).toBeVisible();
    await expect(page.getByText('32 lata')).toBeVisible();

    await page.getByRole('button', { name: 'Wyloguj' }).click();
    await expect(page).toHaveURL(/\/pl\/login/, { timeout: 10000 });
  });
});
