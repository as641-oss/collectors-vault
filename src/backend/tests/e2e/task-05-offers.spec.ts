import { test, expect } from '@playwright/test';
import { table } from 'node:console';

test.describe('Task 5 - Offers System', () => {
  test.setTimeout(60000);

  test('seller can view and accept a received offer', async ({ page }) => {
    await page.goto('http://localhost/login');

    await page.getByPlaceholder('Email').fill('seller1@collectorsvault.dev');
    await page.getByPlaceholder('Password').fill('Password123!');
    await page.locator('button.gold-btn').click();

    await page.waitForTimeout(1500);

    await page.goto('http://localhost/seller/listings');
    await expect(page.locator('h2')).toContainText('Seller Listings');

    await page.getByRole('button', { name: 'Offers' }).click();
    await page.waitForTimeout(1000);

    const offersTable = page.locator('table').last();

    await expect(offersTable).not.toContainText('No offers received.');
    await expect(offersTable).toContainText('Sample Comics Item 7');
    await expect(offersTable).toContainText('buyer1@collectorsvault.dev');
    await page.getByRole('button', { name: 'Accept' }).first().click();
  });
});