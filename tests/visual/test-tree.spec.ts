import { test, expect } from '@playwright/test';

test('QspResourceTree visual baselines', async ({ page }) => {
  await page.goto('http://localhost:3000');
  const tree = page.locator('data-testid=qsp-resource-tree');
  await expect(tree).toBeVisible();

  // Verificar estados: Degraded propaga a padre (simulado con demoData)
  await expect(page.locator('text=Degraded')).toBeVisible();

  // Screenshot comparison vs baseline
  await expect(page).toHaveScreenshot('baseline-structura.png', {
    maxDiffPixels: 50,
    threshold: 0.05,
  });
});
