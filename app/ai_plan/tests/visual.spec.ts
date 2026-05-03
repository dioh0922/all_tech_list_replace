import { test, expect } from '@playwright/test';

test('Home page should have correct title and layout', async ({ page }) => {
  await page.goto('http://localhost:3000/');
  await expect(page).toHaveTitle(/Tech List Manager/);
  const header = page.locator('header');
  await expect(header).toBeVisible();
  const logo = page.locator('.logo');
  await expect(logo).toHaveText('Tech List Manager');
});

test('Login page should have form fields', async ({ page }) => {
  await page.goto('http://localhost:3000/login');
  const cardTitle = page.locator('.card-title');
  await expect(cardTitle).toHaveText('Login');
  await expect(page.locator('input[name="userId"]')).toBeVisible();
  await expect(page.locator('input[name="pass"]')).toBeVisible();
  await expect(page.locator('button[type="submit"]')).toHaveText('Login');
});

test('Take screenshots', async ({ page }) => {
  await page.goto('http://localhost:3000/');
  await page.screenshot({ path: 'ai_plan/screenshots/list_page_test.png', fullPage: true });
  
  await page.goto('http://localhost:3000/login');
  await page.screenshot({ path: 'ai_plan/screenshots/login_page_test.png', fullPage: true });
});
