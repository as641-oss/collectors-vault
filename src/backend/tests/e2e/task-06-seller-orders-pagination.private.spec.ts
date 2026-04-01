import { test, expect } from '@playwright/test';

test.describe('Task 6 - Seller Orders Pagination (Private)', () => {
  test('previous button is disabled on first page', async ({ page }) => {
    await page.goto('http://localhost/login');

    await page.getByPlaceholder('Email').fill('seller1@collectorsvault.dev');
    await page.getByPlaceholder('Password').fill('Password123!');
    await page.locator('button.gold-btn, button[type="submit"]').click();

    await expect(page).not.toHaveURL(/\/login$/);

    await page.goto('http://localhost/seller/orders');

    const previousButton = page.getByRole('button', { name: 'Previous' });

    await expect(previousButton).toBeVisible();
    await expect(previousButton).toBeDisabled();
  });
});