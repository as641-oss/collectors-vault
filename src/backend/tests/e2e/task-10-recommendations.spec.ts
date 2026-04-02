import { test, expect } from '@playwright/test';

test.describe('Task 10 - Recommendations', () => {
  test('buyer can view recommendations on a listing detail page and open one', async ({ page }) => {
    await page.goto('http://localhost/marketplace/sample-comics-7');

    const recommendations = page.getByTestId('recommendations-section');

    await expect(recommendations).toBeVisible();
    await expect(recommendations).toContainText('Recommended for you');

    const firstCard = recommendations.locator('.card').first();
    await expect(firstCard).toBeVisible();

    const firstViewLink = firstCard.locator('a, button').last();
    await expect(firstViewLink).toBeVisible();

    await firstViewLink.click();

    await expect(page).toHaveURL(/\/marketplace\/.+/);
    await expect(page).not.toHaveURL(/sample-comics-7$/);
    await expect(page.locator('h1')).toBeVisible();
  });
});