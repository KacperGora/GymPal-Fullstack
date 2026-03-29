import { test, expect } from '@playwright/test';

import { loginAsTrainer, loginAsClient } from './utils/auth';

test.describe('Trainer invite flow', () => {
  test('login as trainer and go to dashboard', async ({ page }) => {
    await loginAsTrainer(page);
  });

  test('generate invite link', async ({ page }) => {
    await loginAsTrainer(page);

    await page.route('**/trainer-client/invite**', (route) =>
      route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({
          token: 'test-token-123',
          link: 'http://localhost:3000/pl/invite?token=test-token-123',
        }),
      }),
    );

    await page.getByRole('button', { name: 'Wygeneruj link' }).click();

    await expect(
      page.getByRole('button', { name: 'Skopiuj link' }),
    ).toBeVisible({ timeout: 5000 });
  });
});

test.describe('accept invite linke as client', () => {
  test('login as client and go to dashboard', async ({ page }) => {
    await loginAsClient(page);
  });

  test('accept inviteLink', async ({ page }) => {
    await loginAsClient(page);

    await page.route('**/trainer-client/accept**', (route) =>
      route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: '{}',
      }),
    );
    await page.goto('/pl/invite?token=test-token-123');
    await page.getByRole('button', { name: 'Akceptuj zaproszenie' }).click();

    await expect(page.getByText('Zaproszenie zaakceptowane')).toBeVisible({
      timeout: 5000,
    });
  });
});
