import { test, expect } from '@playwright/test';

test.describe('Script AI front-page', () => {
  const baseURL = 'http://localhost:3000';

  test('should load the homepage and show main sections', async ({ page }) => {
    await page.goto(baseURL);

    // Check title contains expected text
    await expect(page).toHaveTitle(/Script AI/i);


    // Check “Get Started” button exists
    const btnGetStarted = page.locator('a', { hasText: /Get Started/i });
    await expect(btnGetStarted).toBeVisible();

    // Scroll to pricing section
    await page.locator('text=Pricing').scrollIntoViewIfNeeded();
    const pricingHeading = page.locator('h3', { hasText: /Starter/i });
    await expect(pricingHeading).toBeVisible();

    // Check that Starter plan displays $0/mo
    const starterPlan = page.locator('text=Starter').locator('..').locator('text=$0/mo');
    await expect(starterPlan).toBeVisible();
  });

//   test('should navigate to login page when clicking “Log In”', async ({ page }) => {
//     await page.goto(baseURL);

//     const loginLink = page.locator('a', { hasText: /Log in/i });
//     await expect(loginLink).toBeVisible();
//     await loginLink.click();

//     // Expect URL to change (adjust path as appropriate)
//     await expect(page).toHaveURL(/login/i);

//     // Optionally check login form fields
//     const emailField = page.locator('input[type="email"]');
//     await expect(emailField).toBeVisible();
//     const passwordField = page.locator('input[type="password"]');
//     await expect(passwordField).toBeVisible();
//   });
});
