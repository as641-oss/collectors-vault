import { test, expect } from '@playwright/test';

test.describe('Task 6 - Seller Orders Pagination', () => {
  test('seller can paginate through orders', async ({ page }) => {
    await page.goto('http://localhost/login');

    await page.getByPlaceholder('Email').fill('seller1@collectorsvault.dev');
    await page.getByPlaceholder('Password').fill('Password123!');
    await page.locator('button.gold-btn, button[type="submit"]').click();

    await expect(page).not.toHaveURL(/\/login$/);

    await page.goto('http://localhost/seller/orders');

    await expect(page.locator('h2')).toContainText('Seller Orders');

    await expect(page.locator('text=Page')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Previous' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Next' })).toBeVisible();

    const pageLabel = page.locator('text=/Page\\s+\\d+\\s+of\\s+\\d+/');
    await expect(pageLabel).toBeVisible();

    const rows = page.locator('tbody > tr').filter({ has: page.locator('td') });
    await expect(rows.first()).toBeVisible();
  });
});