import { test, expect } from '@playwright/test';

test.describe('Task 3 - Mark listing sold (Private)', () => {
  test('seller can create a listing, mark it sold, and see it in Sold tab', async ({ page }) => {
    const title = `Private Sold Test ${Date.now()}`;

    await page.goto('http://localhost/login');
    await page.getByPlaceholder('Email').fill('seller1@vault-private.dev');
    await page.getByPlaceholder('Password').fill('VaultPass123!');
    await page.locator('button.gold-btn').click();

    await expect(page).not.toHaveURL(/\/login$/);

    await page.goto('http://localhost/seller/listings');
    await expect(page.locator('h2')).toContainText('Seller Listings');

    await page.locator('input[name="title"]').fill(title);
    await page.locator('select[name="categoryId"]').selectOption({ index: 1 });
    await page.locator('input[name="itemType"]').fill('card');
    await page.locator('input[name="brandOrSeries"]').fill('Private Playwright Series');
    await page.locator('input[name="conditionLabel"]').fill('Near Mint');
    await page.locator('textarea[name="description"]').fill('Private test listing for sold flow');
    await page.locator('input[name="price"]').fill('89.99');
    await page.locator('input[name="shippingFee"]').fill('5.99');
    await page.locator('input[name="quantityAvailable"]').fill('1');
    await page.locator('input[name="coverImageUrl"]').fill('https://placehold.co/600x400?text=Private');

    await page.getByRole('button', { name: /create listing/i }).click();
    await expect(page.locator('.alert-success')).toContainText(/listing created successfully/i);

    const activeRow = page.locator('tbody tr').filter({ hasText: title }).first();
    await expect(activeRow).toBeVisible();
    await expect(activeRow.locator('[data-testid="listing-status-badge"]')).toHaveText(/active/i);

    await activeRow.getByRole('button', { name: /mark sold/i }).click();

    const soldTab = page.locator('button').filter({ hasText: 'Sold' }).first();
    await soldTab.click();

    const soldRow = page.locator('tbody tr').filter({ hasText: title }).first();
    await expect(soldRow).toBeVisible();
    await expect(soldRow.locator('[data-testid="listing-status-badge"]')).toHaveText(/sold/i);
  });

  test('sold listing no longer appears in Active tab', async ({ page }) => {
    const title = `Private Active Removal ${Date.now()}`;

    await page.goto('http://localhost/login');
    await page.getByPlaceholder('Email').fill('seller1@vault-private.dev');
    await page.getByPlaceholder('Password').fill('VaultPass123!');
    await page.locator('button.gold-btn').click();

    await expect(page).not.toHaveURL(/\/login$/);

    await page.goto('http://localhost/seller/listings');
    await expect(page.locator('h2')).toContainText('Seller Listings');

    await expect(page.locator('select[name="categoryId"]')).toBeVisible();
    await page.waitForFunction(() => {
      const select = document.querySelector('select[name="categoryId"]');
      return !!select && select.options.length > 1;
    });

    await page.locator('input[name="title"]').fill(title);
    await page.locator('select[name="categoryId"]').selectOption({ index: 1 });
    await page.locator('input[name="itemType"]').fill('card');
    await page.locator('input[name="brandOrSeries"]').fill('Private Playwright Series');
    await page.locator('input[name="conditionLabel"]').fill('Near Mint');
    await page.locator('textarea[name="description"]').fill('Private sold listing active-tab test');
    await page.locator('input[name="price"]').fill('49.99');
    await page.locator('input[name="shippingFee"]').fill('5.99');
    await page.locator('input[name="quantityAvailable"]').fill('1');
    await page.locator('input[name="coverImageUrl"]').fill('https://placehold.co/600x400?text=Private');

    await page.getByRole('button', { name: /create listing/i }).click();
    await expect(page.locator('.alert-success')).toContainText(/listing created successfully/i);

    const activeRow = page.locator('tbody tr').filter({ hasText: title }).first();
    await expect(activeRow).toBeVisible();
    await expect(activeRow.locator('[data-testid="listing-status-badge"]')).toHaveText(/active/i);

    await activeRow.getByRole('button', { name: /mark sold/i }).click();

    await page.locator('button').filter({ hasText: 'Active' }).first().click();
    await expect(page.locator('tbody tr').filter({ hasText: title })).toHaveCount(0);

    await page.locator('button').filter({ hasText: 'Sold' }).first().click();

    const soldRow = page.locator('tbody tr').filter({ hasText: title }).first();
    await expect(soldRow).toBeVisible();
    await expect(soldRow.locator('[data-testid="listing-status-badge"]')).toHaveText(/sold/i);
  });
});
