# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: shell.spec.ts >> Dashboard Shell Responsive >> Capture screenshots across viewports
- Location: e2e\shell.spec.ts:6:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByText('No tasks for today')
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" getByText('No tasks for today') with timeout 5000ms
  - waiting for getByText('No tasks for today')

```

```yaml
- text: Login Enter your email below to login to your account Email
- textbox "Email":
  - /placeholder: m@example.com
- text: Password
- link "Forgot your password?":
  - /url: /auth/forgot-password
- textbox "Password"
- button "Login"
- text: Don't have an account?
- link "Sign up":
  - /url: /auth/sign-up
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | import fs from 'fs';
  3  | import path from 'path';
  4  | 
  5  | test.describe('Dashboard Shell Responsive', () => {
  6  |   test('Capture screenshots across viewports', async ({ page }, testInfo) => {
  7  |     await page.goto('/test-shell');
  8  |     
  9  |     // Wait for empty state to be visible
> 10 |     await expect(page.getByText("No tasks for today")).toBeVisible();
     |                                                        ^ Error: expect(locator).toBeVisible() failed
  11 | 
  12 |     const viewportName = testInfo.project.name.replace(/\s+/g, '-').toLowerCase();
  13 |     
  14 |     // Create artifacts directory if it doesn't exist
  15 |     const artifactsDir = path.join(process.env.APPDATA || process.env.HOME || '', '.gemini', 'antigravity-ide', 'brain', '1cdee819-d0f5-4de7-af34-95a19240d046', 'scratch');
  16 |     fs.mkdirSync(artifactsDir, { recursive: true });
  17 | 
  18 |     // Take screenshot
  19 |     await page.screenshot({ path: path.join(artifactsDir, `shell-${viewportName}.png`), fullPage: true });
  20 |     
  21 |     if (viewportName.includes('mobile')) {
  22 |       // Test mobile menu drawer interaction
  23 |       const menuButton = page.getByRole('button', { name: 'Open sidebar' });
  24 |       await menuButton.click();
  25 |       
  26 |       // Wait for drawer to open
  27 |       await expect(page.getByText('SmartClose TC').nth(1)).toBeVisible(); // 2nd instance is in drawer
  28 |       await page.screenshot({ path: path.join(artifactsDir, `shell-drawer-${viewportName}.png`) });
  29 |     }
  30 |   });
  31 | });
  32 | 
```