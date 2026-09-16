import { test, expect } from '@playwright/test';

test('has title and login form', async ({ page }) => {
  await page.goto('/login');
  
  await expect(page.getByRole('heading', { name: 'SmartClose TC' })).toBeVisible();
  await expect(page.getByLabel('Email address')).toBeVisible();
  await expect(page.getByLabel('Password')).toBeVisible();
});

test('redirects to login if not authenticated', async ({ page }) => {
  await page.goto('/dashboard');
  
  // Should redirect to login
  await expect(page).toHaveURL(/.*\/login/);
});
