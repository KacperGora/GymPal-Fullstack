import { test, expect } from '@playwright/test';

import { registerAndLogin } from './utils/auth';

test.describe('Workouts flow', () => {
  test('add workout and open add exercise modal', async ({ page }) => {
    await registerAndLogin(page, 'workouts');

    await page.goto('/pl/workouts');

    await page.getByRole('button', { name: 'Dodaj trening' }).first().click();

    const workoutName = `Trening ${crypto.randomUUID().slice(0, 8)}`;

    await page.getByLabel('Nazwa treningu').fill(workoutName);
    await page.getByLabel('Czas trwania').fill('45');
    await page.getByLabel('Spalone kalorie').fill('350');
    await page.getByLabel('Notatki').fill('E2E test');

    await page.getByRole('button', { name: 'Dodaj' }).click();

    await expect(page.getByText(workoutName, { exact: true })).toBeVisible();

    await page.getByText(workoutName, { exact: true }).click();

    await page.getByRole('button', { name: 'Dodaj ćwiczenie' }).click();

    await page.getByLabel('Szukaj ćwiczenia').fill('a');
    await expect(page.getByText('Wpisz minimum 2 znaki')).toBeVisible({
      timeout: 5000,
    });

    await page.getByRole('button', { name: 'Anuluj' }).click();

    await page.keyboard.press('Escape');
  });
});
