実行手順 — Memo Desk (ローカル)

前提
- Node.js がインストールされていること
- （オプション）ローカルの Chrome がインストールされていること（E2E テスト用）

開発用サーバ起動
```bash
node start-local-node.mjs
```
- ブラウザで http://localhost:4173/memo.html を開いて使えます。

依存インストール（テストを行うとき）
```bash
npm install
```

E2E テスト実行（ヘッドレス）
```bash
npm run test:e2e
```

変更点の概要
- `app.js`:
  - 設定モーダル（歯車アイコン）を実装
  - 明るさリセット機能を追加
  - カスタム削除確認ダイアログを追加し、ローカルデータ削除とメモ削除で共通化
  - 自動下書き保存（autosave）を実装・安定化
- `memo.html`, `styles.css`: 設定ダイアログとモーダルのマークアップ/スタイルを追加/更新
- E2E テスト: `tests/e2e.spec.js` を追加して autosave と削除フローを検証
- `package.json` にスクリプトと devDependencies を追加

備考
- ネットワークが制限された環境では Playwright のブラウザの自動ダウンロードが失敗する場合があります。その場合はローカル Chrome を利用する設定でテストを実行しました。

ご要望があれば、これをZIP化して渡す・または GitHub リポジトリ化する準備をします。