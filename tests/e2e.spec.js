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
      localStorage.setItem('memo-desk-custom-colors', JSON.stringify({
        accent: '#0f766e',
        bg: '#f7f5f0',
        text: '#202124',
        cardBg: '#fffefb'
      }));
    });

    await page.goto('/memo.html');
    await page.waitForSelector('#settingsButton');

    const styles = await page.evaluate(() => {
      const read = (selector) => {
        const element = document.querySelector(selector);
        const computed = getComputedStyle(element);
        return {
          color: computed.color,
          textFillColor: computed.webkitTextFillColor,
          background: computed.backgroundColor
        };
      };

      return {
        rootText: getComputedStyle(document.documentElement).getPropertyValue('--text').trim(),
        settings: read('#settingsButton'),
        newMemo: read('#newMemoButton'),
        sort: read('#sortSelect'),
        search: read('#searchInput'),
        tag: read('#tagFilterButton')
      };
    });

    expect(styles.rootText).toBe('#eef3f1');
    for (const key of ['settings', 'newMemo', 'sort', 'search', 'tag']) {
      expect(styles[key].color).not.toBe('rgb(0, 0, 0)');
      expect(styles[key].textFillColor).not.toBe('rgb(0, 0, 0)');
    }
    expect(styles.settings.background).not.toBe('rgb(255, 255, 255)');
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
    await page.addInitScript(() => {
      localStorage.setItem('memo-desk-local-entry', 'true');
    });

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
    await expect(page.locator('#settingsDialog #logoutButton')).toHaveText('ログイン画面に戻る');
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

  test('tag filter opens dialog and filters by selected tag', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('memo-desk-local-memos', JSON.stringify([
        {
          id: 'tag-1',
          title: 'コジプロメモ',
          body: 'tag filter',
          tags: ['コジプロ'],
          updatedAt: new Date().toISOString(),
          favorite: false,
          pinned: false,
          reminderAt: ''
        },
        {
          id: 'tag-2',
          title: 'タスクメモ',
          body: 'tag filter',
          tags: ['タスク'],
          updatedAt: new Date(Date.now() - 1000).toISOString(),
          favorite: false,
          pinned: false,
          reminderAt: ''
        }
      ]));
    });

    await page.goto('/memo.html');
    await page.waitForSelector('#tagFilterButton');
    await page.click('#tagFilterButton');
    await page.waitForSelector('#tagFilterDialog:not([hidden])');
    await expect(page.locator('#tagFilter button')).toContainText(['すべて', 'コジプロ', 'タスク']);

    await page.getByRole('button', { name: 'コジプロ', exact: true }).click();
    await expect(page.locator('#tagFilterDialog')).toBeHidden();
    await expect(page.locator('#tagFilterButton')).toHaveText('タグ: コジプロ');
    await expect(page.locator('.memo-card h3')).toHaveText('コジプロメモ');

    await page.click('#tagFilterButton');
    await page.getByRole('button', { name: 'すべて', exact: true }).click();
    await expect(page.locator('#tagFilterButton')).toHaveText('タグ絞り込み');
    await expect(page.locator('.memo-card')).toHaveCount(2);
  });

  test('tag filter button stays horizontal on desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 768 });
    await page.goto('/memo.html');
    await page.waitForSelector('#tagFilterButton');

    const buttonStyle = await page.locator('#tagFilterButton').evaluate((button) => {
      const style = getComputedStyle(button);
      const box = button.getBoundingClientRect();
      return {
        writingMode: style.writingMode,
        whiteSpace: style.whiteSpace,
        wordBreak: style.wordBreak,
        width: box.width,
        height: box.height
      };
    });

    expect(buttonStyle.writingMode).toBe('horizontal-tb');
    expect(buttonStyle.whiteSpace).toBe('nowrap');
    expect(buttonStyle.wordBreak).toBe('keep-all');
    expect(buttonStyle.width).toBeGreaterThan(buttonStyle.height);
  });
});
