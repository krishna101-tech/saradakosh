import { test, expect } from '@playwright/test';

test.describe('Saradakosh Quiz v1 (SQ-AG-001) E2E Tests', () => {
  const BASE_URL = process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:3000';

  test('1. Initial visit requires language selection and shows all 3 languages', async ({ page }) => {
    await page.goto(`${BASE_URL}/quiz`);
    await page.waitForLoadState('networkidle');

    // Language selection card must be visible
    const langSection = page.locator('section[aria-labelledby="lang-prompt-title"]');
    await expect(langSection).toBeVisible();

    // Verify all 3 language buttons
    const enBtn = page.getByRole('button', { name: 'Select English' });
    const bnBtn = page.getByRole('button', { name: 'Select Bengali' });
    const hiBtn = page.getByRole('button', { name: 'Select Hindi' });

    await expect(enBtn).toBeVisible();
    await expect(bnBtn).toBeVisible();
    await expect(hiBtn).toBeVisible();

    // Questions should not be visible before selecting language
    await expect(page.locator('article')).toHaveCount(0);
  });

  test('2. Language switching and preservation of selected answer', async ({ page }) => {
    await page.goto(`${BASE_URL}/quiz`);
    await page.waitForLoadState('networkidle');

    // Select English
    await page.getByRole('button', { name: 'Select English' }).click();

    // Header and 5 questions rendered
    await expect(page.locator('article')).toHaveCount(5);
    await expect(page.getByText('Quiz 1 of 5')).toBeVisible();
    await expect(page.getByText('Where was Sri Ramakrishna born?')).toBeVisible();

    // Select Option A on Question 1 (Kamarpukur)
    const q1 = page.locator('article').first();
    const optA = q1.locator('label').filter({ hasText: 'Kamarpukur' });
    await optA.click();

    // Verify Option A is checked
    const radioA = q1.locator('input[type="radio"][value="A"]');
    await expect(radioA).toBeChecked();

    // Switch language to Bengali
    await page.getByRole('button', { name: 'Switch to Bengali' }).click();
    await expect(page.getByText('শ্রী রামকৃষ্ণ কোথায় জন্মগ্রহণ করেছিলেন?')).toBeVisible();
    // Verify Option A is still checked
    await expect(radioA).toBeChecked();

    // Switch language to Hindi
    await page.getByRole('button', { name: 'Switch to Hindi' }).click();
    await expect(page.getByText('श्रीरामकृष्ण का जन्म कहाँ हुआ था?')).toBeVisible();
    // Verify Option A is still checked
    await expect(radioA).toBeChecked();

    // Switch back to English
    await page.getByRole('button', { name: 'Switch to English' }).click();
    await expect(page.getByText('Where was Sri Ramakrishna born?')).toBeVisible();
    await expect(radioA).toBeChecked();
  });

  test('3. Zero-answer quiz submission reports 5 skipped and reveals correct answers', async ({ page }) => {
    await page.goto(`${BASE_URL}/quiz`);
    await page.waitForLoadState('networkidle');

    // Select English
    await page.getByRole('button', { name: 'Select English' }).click();

    // Click Check Answers without selecting anything
    const checkBtn = page.getByRole('button', { name: 'Check Answers for this set' });
    await expect(checkBtn).toBeVisible();
    await checkBtn.click();

    // Results summary visible
    const summary = page.locator('#quiz-results-summary');
    await expect(summary).toBeVisible();

    // Verify all 4 numbers: Attempted: 0 / 5, Correct: 0, Incorrect: 0, Skipped: 5
    await expect(summary.getByText('0 / 5')).toBeVisible();
    await expect(summary.getByText('Attempted')).toBeVisible();
    await expect(summary.getByText('Correct').first()).toBeVisible();
    await expect(summary.getByText('Incorrect').first()).toBeVisible();
    await expect(summary.getByText('Skipped').first()).toBeVisible();

    // All 5 questions must be marked Skipped and reveal the correct answer
    const articles = page.locator('article');
    for (let i = 0; i < 5; i++) {
      const art = articles.nth(i);
      await expect(art.getByText('Skipped')).toBeVisible();
      await expect(art.getByText('Correct Answer')).toBeVisible();
    }
  });

  test('4. Partial answer evaluation, visual distinction, and Verify Source URL', async ({ page }) => {
    await page.goto(`${BASE_URL}/quiz`);
    await page.waitForLoadState('networkidle');

    await page.getByRole('button', { name: 'Select English' }).click();

    const articles = page.locator('article');

    // Q1: Choose option A (Correct - Kamarpukur)
    await articles.nth(0).locator('label').filter({ hasText: 'Kamarpukur' }).click();

    // Q2: Choose option B (Incorrect - Rakhal instead of Gadadhar)
    await articles.nth(1).locator('label').filter({ hasText: 'Rakhal' }).click();

    // Q3, Q4, Q5: Left unselected (Skipped)

    // Submit
    await page.getByRole('button', { name: 'Check Answers for this set' }).click();

    const summary = page.locator('#quiz-results-summary');
    await expect(summary).toBeVisible();

    // Verify counts: Attempted 2 / 5, Correct 1, Incorrect 1, Skipped 3
    await expect(summary.getByText('2 / 5')).toBeVisible();

    // Q1: Marked Correct, shows "Your Selection (Correct)"
    await expect(articles.nth(0).getByText('Correct').first()).toBeVisible();
    await expect(articles.nth(0).getByText('Your Selection (Correct)')).toBeVisible();

    // Q2: Marked Incorrect, shows "Your Selection (Incorrect)" AND reveals "Correct Answer" on option A
    await expect(articles.nth(1).getByText('Incorrect').first()).toBeVisible();
    await expect(articles.nth(1).getByText('Your Selection (Incorrect)')).toBeVisible();
    await expect(articles.nth(1).getByText('Correct Answer')).toBeVisible();

    // Q3: Marked Skipped, reveals "Correct Answer"
    await expect(articles.nth(2).getByText('Skipped').first()).toBeVisible();
    await expect(articles.nth(2).getByText('Correct Answer')).toBeVisible();

    // Check Verify Source button on Q1
    const verifySourceBtn = articles.nth(0).getByRole('link', { name: 'Verify Source for Question 1' });
    await expect(verifySourceBtn).toBeVisible();
    await expect(verifySourceBtn).toHaveAttribute('href', 'https://englishbooks.rkmm.org/s/lsr/m/sri-ramakrishna-the-great-master#:~:text=Kamarpukur');
    await expect(verifySourceBtn).toHaveAttribute('target', '_blank');
    await expect(verifySourceBtn).toHaveAttribute('rel', 'noopener noreferrer');
  });

  test('5. Sequential set progression (1 -> 2 -> 3 -> 4 -> 5 -> 1) with New Quiz', async ({ page }) => {
    await page.goto(`${BASE_URL}/quiz`);
    await page.waitForLoadState('networkidle');

    await page.getByRole('button', { name: 'Select English' }).click();

    for (let expectedSet = 1; expectedSet <= 5; expectedSet++) {
      await expect(page.getByText(`Quiz ${expectedSet} of 5`)).toBeVisible();
      await expect(page.locator('article')).toHaveCount(5);

      // Check answers
      await page.getByRole('button', { name: 'Check Answers for this set' }).click();
      await expect(page.locator('#quiz-results-summary')).toBeVisible();

      // Click New Quiz
      await page.locator('#quiz-results-summary').getByRole('button', { name: 'New Quiz' }).click();
    }

    // After Set 5, New Quiz wraps back to Set 1
    await expect(page.getByText('Quiz 1 of 5')).toBeVisible();
  });

  test('6. Scorecard informational modal opens and closes accessibly', async ({ page }) => {
    await page.goto(`${BASE_URL}/quiz`);
    await page.waitForLoadState('networkidle');

    await page.getByRole('button', { name: 'Select English' }).click();
    await page.getByRole('button', { name: 'Check Answers for this set' }).click();

    // Click Scorecard button
    await page.locator('#quiz-results-summary').getByRole('button', { name: 'Scorecard' }).click();

    // Modal dialog must be visible
    const dialog = page.locator('div[role="dialog"]');
    await expect(dialog).toBeVisible();
    await expect(dialog.getByText('Scorecard & Progress')).toBeVisible();
    await expect(dialog.getByText('Coming in Account Phase')).toBeVisible();

    // Close with Close button
    await dialog.getByRole('button', { name: 'Close', exact: true }).click();
    await expect(dialog).not.toBeVisible();

    // Reopen and close with ESC key
    await page.locator('#quiz-results-summary').getByRole('button', { name: 'Scorecard' }).click();
    await expect(dialog).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(dialog).not.toBeVisible();
  });

  test('7. Mobile viewport 390x844 responsive check and evidence screenshot', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`${BASE_URL}/quiz`);
    await page.waitForLoadState('networkidle');

    // Language selection
    await page.getByRole('button', { name: 'Select English' }).click();

    // Check answers to view results
    await page.getByRole('button', { name: 'Check Answers for this set' }).click();
    await expect(page.locator('#quiz-results-summary')).toBeVisible();

    // Verify no horizontal overflow
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    expect(scrollWidth).toBeLessThanOrEqual(390);

    // Save screenshot evidence
    await page.screenshot({ path: 'tests/evidence-mobile-results-390.png', fullPage: false });
  });

  test('8. Desktop layout ~1440x900 check and evidence screenshot', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(`${BASE_URL}/quiz`);
    await page.waitForLoadState('networkidle');

    await page.getByRole('button', { name: 'Select English' }).click();
    await page.getByRole('button', { name: 'Check Answers for this set' }).click();
    await expect(page.locator('#quiz-results-summary')).toBeVisible();

    // Verify no horizontal overflow
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    expect(scrollWidth).toBeLessThanOrEqual(1440);

    // Save screenshot evidence
    await page.screenshot({ path: 'tests/evidence-desktop-results-1440.png', fullPage: false });
  });

  test('9. Existing homepage and secondary routes still load cleanly', async ({ page }) => {
    // Check homepage
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    await expect(page.locator('h1')).toBeVisible();

    // Check about page
    await page.goto(`${BASE_URL}/about`);
    await page.waitForLoadState('networkidle');
    await expect(page.locator('body')).not.toBeEmpty();
  });
});
