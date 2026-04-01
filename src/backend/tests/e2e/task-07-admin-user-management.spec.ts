import { test, expect } from '@playwright/test';

test.describe('Task 7 - Admin User Management', () => {
  test('admin can view users, change role, and toggle user status', async ({ page }) => {
    await page.goto('http://localhost/login');

    await page.getByPlaceholder('Email').fill('admin@collectorsvault.dev');
    await page.getByPlaceholder('Password').fill('Password123!');
    await page.locator('button').filter({ hasText: /login/i }).click();

    await expect(page).not.toHaveURL(/\/login$/);

    await page.goto('http://localhost/admin/users');

    await expect(page.locator('h2')).toContainText(/admin users|user management/i);
    await expect(page.locator('table')).toBeVisible();
    await expect(page.locator('body')).toContainText('buyer1@collectorsvault.dev');

    const buyerRow = page.locator('tr', {
      has: page.locator('td', { hasText: 'buyer1@collectorsvault.dev' })
    });

    await expect(buyerRow).toBeVisible();

    const roleSelect = buyerRow.locator('select');
    await roleSelect.selectOption('seller');

    await expect(page.locator('body')).toContainText(/role updated successfully/i);

    const actionButton = buyerRow.locator('button');
    await expect(actionButton).toHaveText(/deactivate/i);
    await actionButton.click();

    await expect(page.locator('body')).toContainText(/status updated successfully/i);
    await expect(buyerRow).toContainText(/inactive/i);
    await expect(actionButton).toHaveText(/activate/i);
  });
});