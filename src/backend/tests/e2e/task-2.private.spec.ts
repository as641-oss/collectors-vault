import { test, expect } from '@playwright/test';

test.describe('Task 2 - Listing Image Upload', () => {
  test('seller can upload an image while creating a listing', async ({ page }) => {

    await page.goto('http://localhost/login');

    await page.getByPlaceholder('Email').fill('seller1@collectorsvault.dev');
    await page.getByPlaceholder('Password').fill('Password123!');

    await Promise.all([
      page.waitForLoadState('networkidle'),
      page.getByRole('button', { name: /login/i }).click(),
    ]);

    await expect(page).not.toHaveURL(/\/login$/);

    await page.goto('http://localhost/seller/listings');
    await page.waitForLoadState('networkidle');

    // Don’t rely on h2 text. Check the actual seller form fields instead.
    await expect(page.locator('input[name="title"]')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('select[name="categoryId"]')).toBeVisible();

    await page.locator('input[name="title"]').fill('Task 2 Upload Listing');
    await page.locator('select[name="categoryId"]').selectOption({ index: 1 });
    await page.locator('input[name="itemType"]').fill('card');
    await page.locator('input[name="brandOrSeries"]').fill('Pokemon');
    await page.locator('input[name="conditionLabel"]').fill('Near Mint');
    await page.locator('textarea[name="description"]').fill('Listing created with uploaded image');
    await page.locator('input[name="price"]').fill('50');
    await page.locator('input[name="shippingFee"]').fill('5');
    await page.locator('input[name="quantityAvailable"]').fill('1');

    await page.setInputFiles(
      'input[type="file"]',
      'src/backend/uploads/1774993388885-chatgpt-image-dec-2--2025--07_14_21-am.png'
    );

    await expect(page.locator('img[alt="Listing preview"]')).toBeVisible({ timeout: 10000 });

    await page.getByRole('button', { name: /create listing/i }).click();

    await expect(page.locator('.alert-success')).toContainText(/listing created successfully/i);
    await expect(page.locator('body')).toContainText('Task 2 Upload Listing');
  });
});