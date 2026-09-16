import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

test.describe('Dashboard Shell Responsive', () => {
  test('Capture screenshots across viewports', async ({ page }, testInfo) => {
    await page.goto('/test-shell');
    
    // Wait for empty state to be visible
    await expect(page.getByText("No tasks for today")).toBeVisible();

    const viewportName = testInfo.project.name.replace(/\s+/g, '-').toLowerCase();
    
    // Create artifacts directory if it doesn't exist
    const artifactsDir = path.join(process.env.APPDATA || process.env.HOME || '', '.gemini', 'antigravity-ide', 'brain', '1cdee819-d0f5-4de7-af34-95a19240d046', 'scratch');
    fs.mkdirSync(artifactsDir, { recursive: true });

    // Take screenshot
    await page.screenshot({ path: path.join(artifactsDir, `shell-${viewportName}.png`), fullPage: true });
    
    if (viewportName.includes('mobile')) {
      // Test mobile menu drawer interaction
      const menuButton = page.getByRole('button', { name: 'Open sidebar' });
      await menuButton.click();
      
      // Wait for drawer to open
      await expect(page.getByText('SmartClose TC').nth(1)).toBeVisible(); // 2nd instance is in drawer
      await page.screenshot({ path: path.join(artifactsDir, `shell-drawer-${viewportName}.png`) });
    }
  });
});
