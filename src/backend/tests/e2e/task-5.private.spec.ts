import { test, expect } from '@playwright/test';

test.describe('Task 5 - Offers System', () => {
  test.setTimeout(60000);

  test('buyer can submit an offer on a listing', async ({ page }) => {
    await page.goto('http://localhost/login');

    await page.getByPlaceholder('Email').fill('buyer1@collectorsvault.dev');
    await page.getByPlaceholder('Password').fill('VaultPass123!');
    await page.locator('button.gold-btn').click();

    await expect(page).not.toHaveURL(/\/login$/);

    await page.goto('http://localhost/account');

    await page.locator('input[name="phone"]').fill('5551234567');
    await page.getByRole('button', { name: /save profile/i }).click();

    await page.getByRole('button', { name: /add address/i }).click();
    await page.locator('input[name="fullName"]').fill('Nina Buyer');
    await page.locator('input[name="line1"]').fill('123 Test Street');
    await page.locator('input[name="city"]').fill('Seattle');
    await page.locator('input[name="state"]').fill('WA');
    await page.locator('input[name="postalCode"]').fill('98101');
    await page.getByRole('button', { name: /save address/i }).click();

    await page.goto('http://localhost/marketplace/sample-comics-7');

    await page.getByRole('button', { name: /make offer/i }).click();

    const offerInput = page.locator('input[name="amount"], input[type="number"]').first();
    await expect(offerInput).toBeVisible();

    await offerInput.fill('80');

    await page.getByRole('button', { name: /submit offer/i }).click();
  });

  test('seller can view and accept a received offer', async ({ page }) => {
    await page.goto('http://localhost/login');

    await page.getByPlaceholder('Email').fill('seller1@collectorsvault.dev');
    await page.getByPlaceholder('Password').fill('VaultPass123!');
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