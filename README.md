# Memo Desk

タイトル・本文・タグ付きのメモを保存・検索できる Web アプリです。データはブラウザの `localStorage` に保存されます。

## 公開 URL

GitHub Pages 有効化後:

**https://yamako822.github.io/memo-desk/**

PWA としてインストールする場合は、上記 URL を Edge / Chrome で開き、「アプリのインストール」から追加してください。

## GitHub への反映手順

1. [GitHub Desktop](https://desktop.github.com/) でこのフォルダ（`memo-desk`）を開く  
   またはターミナルでこのディレクトリに移動する
2. 変更をコミット（例: `Add memo app and PWA support`）
3. **Push origin** で `https://github.com/yamako822/memo-desk` に送信
4. GitHub のリポジトリ → **Settings** → **Pages** → **Build and deployment** で **Source** を **GitHub Actions** に設定
5. 数分後、上記 URL でアクセスできることを確認

## ローカルで試す

`index.html` を `http://localhost` 経由で開いてください（`file://` では PWA が使えません）。

```powershell
# Node が入っている場合の例
npx serve .
```
