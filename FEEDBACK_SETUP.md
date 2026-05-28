# 要望フォーム設定手順

Memo Desk の **要望を送る** ボタンは、Google フォームの共有リンクを開きます。

## 1. Google フォームを作る

1. https://forms.google.com/ を開く
2. **空白のフォーム** を作成
3. タイトルを `Memo Desk ご意見フォーム` にする
4. 質問を追加する

おすすめ項目:

| 質問 | 形式 | 必須 |
|------|------|------|
| 種類 | ラジオボタン | はい |
| 内容 | 段落 | はい |
| 返信用メール | 記述式 | いいえ |

種類の選択肢:

- 追加してほしい機能
- 使いづらい点
- 不具合
- その他

## 2. 回答通知をオンにする

1. フォームの **回答** タブを開く
2. 右上の **︙** を押す
3. **新しい回答についてのメール通知を受け取る** をオンにする

## 3. フォームURLをアプリに設定する

1. フォーム右上の **送信** を押す
2. リンクアイコンを選ぶ
3. URLをコピー
4. `feedback-config.js` の `formUrl` に貼り付ける

```js
export const feedbackConfig = {
  formUrl: "https://docs.google.com/forms/d/e/xxxxxxxx/viewform",
};
```

## 4. GitHub Pages に反映する

```powershell
git add .
git commit -m "Add feedback form link"
git push
```

1〜2 分後、公開URLで **要望を送る** ボタンを確認します。

## 補足: フォームの自動作成について

Google Forms API でフォーム作成はできますが、あなたの Google アカウントで OAuth 認証が必要です。Codex からはあなたの Google アカウントに直接ログインできないため、フォーム本体は上記手順で作成してください。
