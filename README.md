# Memo Desk

タイトル・本文・タグ付きのメモを保存・検索できる Web アプリです。データはブラウザの `localStorage` に保存されます。

## 公開 URL

**https://yamako822.github.io/memo-desk/**

PWA としてインストールする場合は、上記 URL を Edge / Chrome で開き、「アプリのインストール」から追加してください。

## GitHub Pages の設定（初回のみ）

1. リポジトリを開く: https://github.com/yamako822/memo-desk  
2. **Settings** → 左の **Pages**  
3. **Build and deployment** の **Source** を **Deploy from a branch** にする  
4. **Branch** を `main`、フォルダを **/ (root)** にして **Save**  
5. 画面上部に緑色の URL が出るまで 1〜3 分待つ  

> **注意:** Source を **GitHub Actions** のままにすると、サイトが公開されません（このプロジェクトはブランチ公開方式です）。

### うまくいかないとき

| 症状 | 対処 |
|------|------|
| 404 のまま | Source が **Deploy from a branch** か確認。`main` / **/ (root)** か確認 |
| ずっと待っている | **Actions** タブは見なくてよい。Settings → Pages の緑の URL を確認 |
| 非公開リポジトリ | 無料プランでは Pages が使えない場合あり。**Public** に変更 |

## 変更を反映する

1. ファイルを編集  
2. コミット → `main` に push  
3. 1〜2 分後に URL を再読み込み  

## ローカルで試す

`index.html` を `http://localhost` 経由で開いてください（`file://` では PWA が使えません）。

```powershell
# Node が入っている場合の例
npx serve .
```
