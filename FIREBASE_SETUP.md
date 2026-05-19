# Firebase Authentication（Googleログイン）の設定手順

Memo Desk に Google アカウントでログインする機能を追加するための、初心者向けガイドです。

## 全体の流れ（約30分）

1. Google アカウントで [Firebase Console](https://console.firebase.google.com/) にログイン
2. 新しいプロジェクトを作る
3. 「Web アプリ」を登録して設定値（API キーなど）をコピー
4. Authentication で「Google」を有効化
5. 公開サイトのドメインを許可リストに追加
6. このリポジトリの `firebase-config.js` に設定値を貼り付け
7. ブラウザで動作確認

---

## ステップ 1: Firebase プロジェクトを作る

1. https://console.firebase.google.com/ を開く
2. **プロジェクトを追加** をクリック
3. プロジェクト名（例: `memo-desk`）を入力 → 続行
4. Google アナリティクスは **無効** で問題ありません → **プロジェクトを作成**

---

## ステップ 2: Web アプリを登録する

1. プロジェクトのトップ画面で **</>（Web）** アイコンをクリック
2. アプリのニックネーム（例: `Memo Desk Web`）を入力
3. **アプリを登録**
4. 表示される `firebaseConfig` の値をメモ（あとで使います）

   例:

   ```javascript
   const firebaseConfig = {
     apiKey: "AIza...",
     authDomain: "memo-desk-xxxxx.firebaseapp.com",
     projectId: "memo-desk-xxxxx",
     storageBucket: "memo-desk-xxxxx.firebasestorage.app",
     messagingSenderId: "123456789",
     appId: "1:123456789:web:abcdef",
   };
   ```

5. **コンソールに進む** をクリック

---

## ステップ 3: Google ログインを有効にする

1. 左メニュー **Build** → **Authentication**
2. **始める**（初回のみ）
3. **Sign-in method** タブ
4. **Google** の行をクリック
5. **有効にする** をオン
6. **プロジェクトのサポートメール** を選ぶ → **保存**

---

## ステップ 4: 公開ドメインを許可する（重要）

GitHub Pages やローカルで動かすには、ドメインの登録が必要です。

1. Authentication 画面の **Settings** タブ
2. **Authorized domains（承認済みドメイン）** を確認
3. 次が含まれているか確認（なければ **ドメインの追加**）:

   | ドメイン | 用途 |
   |---------|------|
   | `localhost` | パソコンでテスト |
   | `yamako822.github.io` | GitHub Pages 本番 |

   > ユーザー名が `yamako822` でない場合は、`あなたのユーザー名.github.io` に置き換えてください。

---

## ステップ 5: コードに設定値を入れる

1. プロジェクトフォルダで `firebase-config.example.js` を `firebase-config.js` にコピー（既にある場合は上書きしない）
2. `firebase-config.js` を開き、`YOUR_...` の部分を Firebase Console の値に置き換える
3. 保存して GitHub に push（GitHub Pages で使う場合）

```powershell
cd "c:\Users\8210627\Documents\GitHub\memo-desk"
# 編集後
git add firebase-config.js
git commit -m "Add Firebase config"
git push
```

### apiKey は公開して大丈夫？

Web アプリの `apiKey` はクライアントに含まれる前提の値です。  
代わりに **承認済みドメイン** と Firebase のルールで保護します。  
`firebase-config.js` を GitHub に上げても一般的には問題ありません。

---

## ステップ 6: 動作確認

### ローカル

```powershell
cd "c:\Users\8210627\Documents\GitHub\memo-desk"
npx serve .
```

ブラウザで `http://localhost:3000`（ポートは表示に従う）を開き、**Google でログイン** を試す。

### 本番（GitHub Pages）

1. push 後 1〜2 分待つ
2. https://yamako822.github.io/memo-desk/ を開く
3. **Google でログイン** → Google アカウントを選ぶ
4. メモ画面が表示されれば成功
5. **ログアウト** でログイン画面に戻ることを確認

---

## よくあるエラー

| 表示・症状 | 原因 | 対処 |
|-----------|------|------|
| Firebase の設定がまだ完了していません | `firebase-config.js` が未設定 | `YOUR_` を実際の値に置き換える |
| `auth/unauthorized-domain` | ドメイン未登録 | Authentication → Settings → 承認済みドメインに追加 |
| ポップアップがブロックされた | ブラウザのポップアップブロック | このサイトのポップアップを許可 |
| `auth/popup-closed-by-user` | ログインを途中で閉じた | もう一度ボタンを押す |
| ログイン後もメモが別人のもの | 以前の名前ログインのデータ | Google ログイン後はユーザー ID ごとに保存（別アカウント） |

---

## ファイル構成（認証まわり）

| ファイル | 役割 |
|---------|------|
| `firebase-config.js` | Firebase の接続情報（あなたが編集） |
| `firebase-config.example.js` | 設定の見本 |
| `app.js` | Google ログイン・ログアウト・メモ機能 |
| `index.html` | ログイン画面の UI |

---

## 次のステップ（任意）

- メモを Firestore に保存して複数端末で同期
- プロフィール画像をヘッダーに表示（`user.photoURL` は既に取得可能）

質問やエラーが出たら、ブラウザの **開発者ツール（F12）→ Console** の赤いメッセージを控えて確認してください。
