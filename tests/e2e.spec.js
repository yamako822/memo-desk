const { test, expect } = require('@playwright/test');

test.describe('Memo Desk E2E', () => {
  test.beforeEach(async ({ page }) => {
    // ensure local mode and autosave enabled before load
    await page.addInitScript(() => {
      localStorage.setItem('memo-desk-local-mode', 'true');
      localStorage.setItem('memo-desk-autosave', 'true');
    });
  });

  test('autosave creates draft in localStorage', async ({ page }) => {
    await page.goto('/memo.html');
    await page.waitForSelector('#memoTitle');
    await page.fill('#memoTitle', 'E2E テストタイトル');
    await page.fill('#memoBody', 'E2E 本文');
    await page.fill('#memoTags', 'e2e');
    // trigger input events
    await page.dispatchEvent('#memoTitle', 'input');
    await page.dispatchEvent('#memoBody', 'input');
    // wait for autosave debounce
    await page.waitForTimeout(1200);
    const draft = await page.evaluate(() => localStorage.getItem('memo-desk-draft'));
    expect(draft).not.toBeNull();
    const parsed = JSON.parse(draft);
    expect(parsed.title).toBe('E2E テストタイトル');
  });

  test('delete opens confirm dialog and removes memo', async ({ page }) => {
    // seed one local memo
    await page.addInitScript(() => {
      localStorage.setItem('memo-desk-local-memos', JSON.stringify([
        { id: 'd1', title: '削除対象', body: 'x', tags: [], updatedAt: new Date().toISOString() }
      ]));
    });

    await page.goto('/memo.html');
    await page.waitForSelector('.delete-button');
    await page.click('.delete-button');
    // confirm dialog should appear
    await page.waitForSelector('#confirmDialog:not([hidden])');
    // click confirm
    await page.click('#confirmOk');
    await page.waitForTimeout(300);
    const memos = JSON.parse(await page.evaluate(() => localStorage.getItem('memo-desk-local-memos') || '[]'));
    expect(memos.length).toBe(0);
  });
});
