import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test('should display login form with email and password fields', async ({ page }) => {
    await page.goto('/login');

    await expect(page.locator('#email')).toBeVisible();
    await expect(page.locator('#password')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('should have Google login button', async ({ page }) => {
    await page.goto('/login');
    await expect(page.locator('text=Continue with Google')).toBeVisible();
  });

  test('should have forgot password link', async ({ page }) => {
    await page.goto('/login');
    await expect(page.locator('text=Forgot your password?')).toBeVisible();
  });

  test('should have sign up link', async ({ page }) => {
    await page.goto('/login');
    await expect(page.locator('text=Sign up')).toBeVisible();
  });

  test('should show validation errors for empty form submission', async ({ page }) => {
    await page.goto('/login');
    await page.locator('button[type="submit"]').click();
    // Browser native validation should prevent submission with required fields empty
    const emailInput = page.locator('#email');
    const isInvalid = await emailInput.evaluate(
      (el) => !(el as HTMLInputElement).validity.valid
    );
    expect(isInvalid).toBe(true);
  });

  test('should redirect unauthenticated users from dashboard to login', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForURL(/login/);
    expect(page.url()).toContain('login');
  });

  test('should navigate to forgot password page', async ({ page }) => {
    await page.goto('/login');
    await page.click('text=Forgot your password?');
    await expect(page).toHaveURL(/forgot-password/);
  });

  test('should navigate to signup from login', async ({ page }) => {
    await page.goto('/login');
    await page.click('text=Sign up');
    await expect(page).toHaveURL(/signup/);
  });
});
