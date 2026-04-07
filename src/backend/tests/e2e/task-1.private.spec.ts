import { test, expect } from '@playwright/test';

test.describe('Task 1 - Marketplace Search (Private)', () => {
  test('search filters listings and shows empty state', async ({ page }) => {
    await page.goto('http://localhost');

    await expect(page.getByTestId('search-input')).toBeVisible();

    await page.getByTestId('search-input').fill('Private');
    await page.getByRole('button', { name: 'Search' }).click();

    await expect(page.locator('[data-testid="listing-card-link"]').first()).toContainText('Private');

    await page.getByTestId('search-input').fill('zzzz-private-not-found');
    await page.getByRole('button', { name: 'Search' }).click();

    await expect(page.getByTestId('search-empty-state')).toBeVisible();
  });

  test('category filter works', async ({ page }) => {
    await page.goto('http://localhost');

    await page.selectOption('select[name="category"]', 'trading-cards-private');

    await expect(page.locator('[data-testid="listing-card-link"]').first()).toContainText('Trading Cards');
  });

  test('sort by price ascending works', async ({ page }) => {
    await page.goto('http://localhost');

    await page.selectOption('select[name="sort"]', 'price_asc');

    const prices = await page.locator('.card-footer .fw-bold').allTextContents();
    const numericPrices = prices.map(p => Number(p.replace('$', '').trim()));

    expect(numericPrices[0]).toBeLessThanOrEqual(numericPrices[1]);
  });
});
