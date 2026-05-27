# Memo Desk

タイトル・本文・タグ付きのメモを保存・検索できる Web アプリです。データはブラウザの `localStorage` に保存されます。

## 公開 URL

**https://yamako822.github.io/memo-desk/**

PWA としてインストールする場合は、上記 URL を Edge / Chrome で開き、「アプリのインストール」から追加してください。

## ログインとメモの同期（Firebase）

- **Google** または **メール・パスワード** でログイン
- メモは **Firestore** に保存（同じアカウントなら別 PC からも同じメモ）
- アカウントごとにメモは分離（他人のメモは見えません）
- ピン留めと並び替えで、重要なメモを上に固定
- Firestore ルールで本文・タグ数・フィールド型を制限
- 想定外の利用に備えて Google Cloud の予算アラート設定を推奨

**設定手順:** [FIREBASE_SETUP.md](./FIREBASE_SETUP.md)（Firestore の作成とセキュリティルールが必要です）

## 運用前チェック

- GitHub Pages: `main` / `/ (root)` で公開
- Firebase Authentication: Google とメール/パスワードを有効化
- Firestore Database: 作成済み
- Firestore ルール: `firestore.rules` を公開済み
- 承認済みドメイン: `yamako822.github.io` を追加済み
- 予算アラート: Google Cloud Billing で設定推奨

## ローカルモード

ログイン画面の **ログインせずに使う** から、このPCだけで使うローカルモードを開始できます。

- ログイン不要
- メモはこのブラウザ内の `localStorage` に保存
- 別PC・別ブラウザとは同期されません
- ブラウザのサイトデータを削除するとローカルメモも消える可能性があります

## GitHub Pages の設定（初回のみ）

1. リポジトリを開く: https://github.com/yamako822/memo-desk/settings/pages  
2. **Build and deployment** の **Source** で **Deploy from a branch** を選ぶ  
3. その直下に出る **Branch** の行で  
   - 1つ目: `main`  
   - 2つ目: `/ (root)`  
   - 右端の **Save**（この行の横にある小さなボタン）を押す  
4. ページ上部に緑色の **Your site is live at …** が出るまで 1〜3 分待つ  

> **Save が押せない・グレーのとき**  
> - **Branch を `main` に選んでから** Save を押す（選ぶ前は押せません）  
> - リポジトリが **Private（非公開）** だと無料プランでは Pages が使えず Save できないことがあります → **Settings → General** で **Public** に変更  
> - すでに `main` / `/ (root)` なら変更不要。緑の URL が出ていれば OK  

> **注意:** Source を **GitHub Actions** のままにしないでください。

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
ログインページは `index.html`、ログイン後のメモページは `memo.html` です。ログイン済みの場合は自動でメモページへ移動します。

```powershell
# Node が入っている場合の例
npx serve .
```

このリポジトリ内の起動スクリプトを使う場合:

```powershell
node .\start-local-node.mjs
```

Node が入っていない場合は、このフォルダで次を実行してください。

```powershell
powershell -ExecutionPolicy Bypass -File .\start-local.ps1
```

表示された `http://127.0.0.1:4173/` をブラウザで開きます。
