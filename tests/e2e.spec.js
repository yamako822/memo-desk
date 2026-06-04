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

  test('saves reminder and shows it on memo card', async ({ page }) => {
    await page.goto('/memo.html');
    await page.waitForSelector('#memoTitle');
    await page.fill('#memoTitle', 'リマインダーテスト');
    await page.fill('#memoBody', '確認する内容');
    await page.fill('#memoReminder', '2026-06-05T09:30');
    await page.click('#saveButton');
    await expect(page.locator('.memo-reminder')).toContainText('リマインダー');

    const memos = JSON.parse(await page.evaluate(() => localStorage.getItem('memo-desk-local-memos') || '[]'));
    expect(memos[0].reminderAt).toContain('2026-06-05');
  });

  test('auto tag fills tags from memo content', async ({ page }) => {
    await page.goto('/memo.html');
    await page.waitForSelector('#memoTitle');
    await page.fill('#memoTitle', '会議タスク');
    await page.fill('#memoBody', '締切までに資料を共有する');
    await page.click('#autoTagButton');
    await expect(page.locator('#memoTags')).toHaveValue(/仕事/);
  });

  test('restores memo dialog that was open before reload', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('memo-desk-local-memos', JSON.stringify([
        {
          id: 'last-open',
          title: '前回開いていたメモ',
          body: 'reload restore',
          tags: [],
          updatedAt: new Date().toISOString(),
          favorite: false,
          pinned: false,
          reminderAt: ''
        }
      ]));
      localStorage.setItem('memo-desk-last-open-memo', JSON.stringify({
        id: 'last-open',
        dataMode: 'local',
        uid: 'local',
        openedAt: new Date().toISOString()
      }));
    });

    await page.goto('/memo.html');
    await page.waitForSelector('#memoDialog:not([hidden])');
    await expect(page.locator('#memoDialogTitle')).toHaveText('前回開いていたメモ');
  });

  test('dark mode keeps settings icon readable', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('memo-desk-display-settings', JSON.stringify({ dark: true, brightness: 100 }));
    });

    await page.goto('/memo.html');
    await page.waitForSelector('#settingsButton');

    const styles = await page.locator('#settingsButton').evaluate((button) => {
      const computed = getComputedStyle(button);
      return {
        color: computed.color,
        textFillColor: computed.webkitTextFillColor,
        background: computed.backgroundColor
      };
    });

    expect(styles.color).not.toBe('rgb(0, 0, 0)');
    expect(styles.textFillColor).not.toBe('rgb(0, 0, 0)');
    expect(styles.background).not.toBe('rgb(255, 255, 255)');
  });

  test('renders reminder even when cached template has no reminder slot', async ({ page }) => {
    await page.route('**/memo.html', async (route) => {
      const response = await route.fetch();
      const body = (await response.text()).replace('<p class="memo-reminder" hidden></p>', '');
      await route.fulfill({ response, body });
    });

    await page.addInitScript(() => {
      localStorage.setItem('memo-desk-local-memos', JSON.stringify([
        {
          id: 'cached-template-reminder',
          title: '古いテンプレート確認',
          body: 'リマインダー表示枠なし',
          tags: [],
          updatedAt: new Date().toISOString(),
          favorite: false,
          pinned: false,
          reminderAt: { seconds: 1812255300, nanoseconds: 0 }
        }
      ]));
    });

    await page.goto('/memo.html');
    await page.waitForSelector('.memo-reminder:not([hidden])');
    await expect(page.locator('.memo-reminder')).toContainText('リマインダー');
  });

  test('settings dialog contains moved home controls and scrolls', async ({ page }) => {
    await page.goto('/memo.html');
    await page.waitForSelector('#settingsButton');
    await page.click('#settingsButton');
    await page.waitForSelector('#settingsDialog:not([hidden])');

    await expect(page.locator('.app-header #settingsButton')).toBeVisible();
    await expect(page.locator('.app-header #helpButton')).toHaveCount(0);
    await expect(page.locator('.app-header #feedbackButton')).toHaveCount(0);
    await expect(page.locator('.app-header #logoutButton')).toHaveCount(0);
    await expect(page.locator('.app-header #usernameForm')).toHaveCount(0);

    await expect(page.locator('#settingsDialog #helpButton')).toBeVisible();
    await expect(page.locator('#settingsDialog #feedbackButton')).toBeVisible();
    await expect(page.locator('#settingsDialog #logoutButton')).toBeVisible();
    await expect(page.locator('#settingsDialog #usernameForm')).toBeVisible();

    const scrollState = await page.locator('.settings-dialog-body').evaluate((body) => {
      const style = getComputedStyle(body);
      return {
        overflowY: style.overflowY,
        canScroll: body.scrollHeight > body.clientHeight
      };
    });

    expect(scrollState.overflowY).toBe('auto');
    expect(scrollState.canScroll).toBeTruthy();
  });
});
