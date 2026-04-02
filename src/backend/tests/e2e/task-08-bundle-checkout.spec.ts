import { test, expect } from '@playwright/test';

test.describe('Task 8 - Bundle Checkout', () => {
  test('buyer can add multiple seeded listings to cart and checkout', async ({ page }) => {
    await page.goto('http://localhost/login');

    await page.getByPlaceholder('Email').fill('buyer1@collectorsvault.dev');
    await page.getByPlaceholder('Password').fill('Password123!');
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
    await page.getByRole('button', { name: 'Add to Cart' }).click();

    await page.goto('http://localhost/marketplace/sample-action-figures-8');
    await page.getByRole('button', { name: 'Add to Cart' }).click();

    await page.goto('http://localhost/cart');
    await expect(page.locator('body')).toContainText('Sample Comics Item 7');
    await expect(page.locator('body')).toContainText('Sample Action Figures Item 8');
    const checkoutBtn = page.getByRole('button', { name: /checkout bundle/i });
    await checkoutBtn.click();
    await expect(page.locator('.card-body.text-muted')).toContainText('Your cart is empty.');
  });
});