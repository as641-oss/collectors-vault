import { test, expect } from '@playwright/test';

test.describe('Task 4 - Saved Filters (Private)', () => {
  test('buyer can save and apply a marketplace filter', async ({ page }) => {
    const filterName = `Private Saved Filter ${Date.now()}`;

    await page.goto('http://localhost/login');

    await page.getByPlaceholder('Email').fill('buyer1@vault-private.dev');
    await page.getByPlaceholder('Password').fill('VaultPass123!');
    await page.locator('button.gold-btn').click();

    await expect(page).not.toHaveURL(/\/login$/);

    await page.goto('http://localhost/marketplace');
    await page.getByTestId('search-input').fill('private comic');

    page.once('dialog', async (dialog) => {
      await dialog.accept(filterName);
    });

    await page.getByRole('button', { name: 'Save Filter' }).click();

    page.once('dialog', async (dialog) => {
      await dialog.accept();
    });

    await page.goto('http://localhost/saved-filters');

    await expect(page.locator('h2')).toContainText('Saved Filters');
    await expect(page.locator('body')).toContainText(filterName);

    const filterCard = page.locator('.card').filter({ hasText: filterName });
    await expect(filterCard).toBeVisible();

    await filterCard.getByRole('button', { name: 'Apply' }).click();

    await expect(page).toHaveURL(/\/marketplace/);
    await expect(page.getByTestId('search-input')).toHaveValue('private comic');
  });
});
