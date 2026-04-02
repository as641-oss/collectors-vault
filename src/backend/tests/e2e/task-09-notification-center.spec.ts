import { test, expect } from '@playwright/test';

test.describe('Task 9 - Notification Center', () => {
  test('seller receives notification after buyer places order', async ({ browser }) => {
    const buyerPage = await browser.newPage();

    await buyerPage.goto('http://localhost/login');
    await buyerPage.getByPlaceholder('Email').fill('buyer1@collectorsvault.dev');
    await buyerPage.getByPlaceholder('Password').fill('Password123!');
    await buyerPage.locator('button.gold-btn').click();

    await expect(buyerPage).not.toHaveURL(/\/login$/);

    await buyerPage.goto('http://localhost/account');

    await buyerPage.locator('input[name="phone"]').fill('5551234567');
    await buyerPage.getByRole('button', { name: /save profile/i }).click();

    await buyerPage.getByRole('button', { name: /add address/i }).click();

    await buyerPage.locator('input[name="fullName"]').fill('Nina Buyer');
    await buyerPage.locator('input[name="line1"]').fill('123 Test Street');
    await buyerPage.locator('input[name="city"]').fill('Seattle');
    await buyerPage.locator('input[name="state"]').fill('WA');
    await buyerPage.locator('input[name="postalCode"]').fill('98101');

    await buyerPage.getByRole('button', { name: /save address/i }).click();

    await buyerPage.goto('http://localhost');

    await buyerPage.getByPlaceholder(/search/i).fill('Sample Comics Item 7');
    await expect(buyerPage.locator('body')).toContainText('Sample Comics Item 7');

    await buyerPage.goto('http://localhost/marketplace/sample-comics-7');

    await buyerPage.locator('button.gold-btn').filter({ hasText: /buy now|purchase/i }).click();

    await expect(buyerPage.locator('body')).toContainText(/order|success|placed|confirmed/i);

    const sellerPage = await browser.newPage();

    await sellerPage.goto('http://localhost/login');
    await sellerPage.getByPlaceholder('Email').fill('seller1@collectorsvault.dev');
    await sellerPage.getByPlaceholder('Password').fill('Password123!');
    await sellerPage.locator('button.gold-btn').click();

    await expect(sellerPage).not.toHaveURL(/\/login$/);

    await sellerPage.goto('http://localhost/notifications');

    await expect(sellerPage.locator('h2')).toContainText('Notifications');
    await expect(sellerPage.locator('body')).toContainText('New order received');

    await buyerPage.close();
    await sellerPage.close();
  });
});