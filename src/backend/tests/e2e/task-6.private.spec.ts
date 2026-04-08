import { test, expect } from '@playwright/test';

test.describe('Task 6 - Seller Orders Pagination', () => {
  test('seller can paginate through orders', async ({ page }) => {
    await page.goto('http://localhost/login');

    await page.getByPlaceholder('Email').fill('seller1@vault-private.dev');
    await page.getByPlaceholder('Password').fill('VaultPass123!');
    await page.locator('button.gold-btn, button[type="submit"]').click();

    await expect(page).not.toHaveURL(/\/login$/);

    await page.goto('http://localhost/seller/orders');

    await expect(page.locator('h2')).toContainText('Seller Orders');

    const pageLabel = page.locator('text=/Page\\s+\\d+\\s+of\\s+\\d+/');
    await expect(pageLabel).toBeVisible();

    const rows = page.locator('tbody > tr').filter({ has: page.locator('td') });
    await expect(rows.first()).toBeVisible();

    const firstRowText = await rows.first().textContent();

    const nextButton = page.getByRole('button', { name: 'Next' });

    await expect(nextButton).toBeVisible();

    if (await nextButton.isEnabled()) {
      await nextButton.click();
      await page.waitForTimeout(1000);

      const secondPageRowText = await rows.first().textContent();
      expect(secondPageRowText).not.toBe(firstRowText);

      const previousButton = page.getByRole('button', { name: 'Previous' });

      if (await previousButton.isEnabled()) {
        await previousButton.click();
        await page.waitForTimeout(1000);

        const returnedRowText = await rows.first().textContent();
        expect(returnedRowText).toBe(firstRowText);
      }
    }
  });
});