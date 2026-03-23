import { test, expect } from '@playwright/test';

test.describe('Navigation & Routing', () => {
  test('should return 200 for homepage', async ({ page }) => {
    const response = await page.goto('/');
    expect(response?.status()).toBe(200);
  });

  test('should return 200 for login page', async ({ page }) => {
    const response = await page.goto('/login');
    expect(response?.status()).toBe(200);
  });

  test('should return 200 for signup page', async ({ page }) => {
    const response = await page.goto('/signup');
    expect(response?.status()).toBe(200);
  });

  test('should return 200 for about-us page', async ({ page }) => {
    const response = await page.goto('/about-us');
    expect(response?.status()).toBe(200);
  });

  test('should return 200 for contact-us page', async ({ page }) => {
    const response = await page.goto('/contact-us');
    expect(response?.status()).toBe(200);
  });

  test('should return 200 for pricing page', async ({ page }) => {
    const response = await page.goto('/pricing');
    expect(response?.status()).toBe(200);
  });

  test('should return 200 for privacy page', async ({ page }) => {
    const response = await page.goto('/privacy');
    expect(response?.status()).toBe(200);
  });

  test('should return 200 for terms page', async ({ page }) => {
    const response = await page.goto('/terms');
    expect(response?.status()).toBe(200);
  });

  test('should show not-found page for invalid routes', async ({ page }) => {
    const response = await page.goto('/this-page-does-not-exist');
    expect(response?.status()).toBe(404);
  });
});
