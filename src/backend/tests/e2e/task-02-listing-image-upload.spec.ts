import { test, expect } from '@playwright/test';
import path from 'path';

test.describe('Task 2 - Listing Image Upload', () => {
  test('seller can upload an image while creating a listing', async ({ page }) => {
    const imagePath = path.resolve('tests/fixtures/test2.png');

    await page.goto('http://localhost/login');

    await page.getByPlaceholder('Email').fill('seller1@collectorsvault.dev');
    await page.getByPlaceholder('Password').fill('Password123!');
    await page.getByRole('button', { name: 'Login' }).click();

    await page.getByRole('link', { name: 'Seller' }).click();

    await expect(page.locator('h2')).toContainText('Seller Listings');
    await expect(page.locator('input[name="title"]')).toBeVisible();

    await page.locator('input[name="title"]').fill('Task 2 Upload Listing');
    await page.locator('select[name="categoryId"]').selectOption({ index: 1 });
    await page.locator('input[name="itemType"]').fill('card');
    await page.locator('input[name="brandOrSeries"]').fill('Pokemon');
    await page.locator('input[name="conditionLabel"]').fill('Near Mint');
    await page.locator('textarea[name="description"]').fill('Listing created with uploaded image');
    await page.locator('input[name="price"]').fill('50');
    await page.locator('input[name="shippingFee"]').fill('5');
    await page.locator('input[name="quantityAvailable"]').fill('1');

    await page.setInputFiles('input[type="file"]', imagePath);

    await expect(page.locator('img[alt="Listing preview"]')).toBeVisible({ timeout: 10000 });

    await page.getByRole('button', { name: 'Create Listing' }).click();

    await expect(page.locator('.alert-success')).toContainText('Listing created successfully.');
    await expect(page.locator('text=Task 2 Upload Listing')).toBeVisible();
  });
});