// Firebase Console → プロジェクトの設定 → マイアプリ → SDK の設定 からコピーして貼り付け
// 詳しくは FIREBASE_SETUP.md を読んでください

export const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.firebasestorage.app",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
};

export function isFirebaseConfigured() {
  return !Object.values(firebaseConfig).some(
    (value) => typeof value === "string" && value.startsWith("YOUR_"),
  );
}
