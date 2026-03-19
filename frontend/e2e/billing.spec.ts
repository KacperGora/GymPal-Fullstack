import { expect, test } from '@playwright/test';

import { registerAndLogin } from './utils/auth';

const MOCK_PLANS = [
  {
    id: 'plan-1',
    name: 'Pro Monthly',
    stripePriceId: 'price_monthly',
    price: 1999,
    currency: 'pln',
    interval: 'month',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'plan-2',
    name: 'Pro Yearly',
    stripePriceId: 'price_yearly',
    price: 19999,
    currency: 'pln',
    interval: 'year',
    createdAt: new Date().toISOString(),
  },
];

const MOCK_ACTIVE_SUBSCRIPTION = {
  id: 'sub-1',
  userId: 1,
  planId: 'plan-1',
  plan: MOCK_PLANS[0],
  stripeCustomerId: 'cus_test',
  stripeSubscriptionId: 'sub_test',
  status: 'ACTIVE',
  currentPeriodStart: new Date().toISOString(),
  currentPeriodEnd: new Date(
    Date.now() + 30 * 24 * 60 * 60 * 1000,
  ).toISOString(),
  cancelAtPeriodEnd: false,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

test.describe('Billing page', () => {
  test('navigates to /billing and shows available plans for new user', async ({
    page,
  }) => {
    await registerAndLogin(page, 'billing');

    await page.route('**/subscriptions/me', (route) =>
      route.fulfill({
        status: 404,
        body: JSON.stringify({ message: 'Not found' }),
      }),
    );
    await page.route('**/subscriptions/plans', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(MOCK_PLANS),
      }),
    );

    await page.goto('/pl/billing');

    await expect(page.getByRole('heading', { level: 4 })).toBeVisible({
      timeout: 10000,
    });
    await expect(page.getByText('Pro Monthly')).toBeVisible();
    await expect(page.getByText('Pro Yearly')).toBeVisible();
  });

  test('shows current subscription card for active subscriber', async ({
    page,
  }) => {
    await registerAndLogin(page, 'billing-active');

    await page.route('**/subscriptions/me', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(MOCK_ACTIVE_SUBSCRIPTION),
      }),
    );

    await page.goto('/pl/billing');

    await expect(page.getByText('Pro Monthly')).toBeVisible({ timeout: 10000 });
    await expect(page.getByRole('button', { name: /zarz/i })).toBeVisible();
  });

  test('checkout redirects to Stripe on plan selection', async ({ page }) => {
    await registerAndLogin(page, 'billing-checkout');

    await page.route('**/subscriptions/me', (route) =>
      route.fulfill({
        status: 404,
        body: JSON.stringify({ message: 'Not found' }),
      }),
    );
    await page.route('**/subscriptions/plans', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(MOCK_PLANS),
      }),
    );

    let checkoutRequested = false;
    await page.route('**/subscriptions/checkout', (route) => {
      checkoutRequested = true;
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ url: 'https://checkout.stripe.com/pay/test' }),
      });
    });

    await page.goto('/pl/billing');
    await expect(page.getByText('Pro Monthly')).toBeVisible({ timeout: 10000 });

    await page
      .getByText('Pro Monthly')
      .locator('..')
      .locator('..')
      .getByRole('button')
      .click();

    await page.waitForTimeout(500);
    expect(checkoutRequested).toBe(true);
  });
});
