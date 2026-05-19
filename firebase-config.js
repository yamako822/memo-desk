// Firebase Console → プロジェクトの設定 → マイアプリ → SDK の設定 からコピーして貼り付け
// 詳しくは FIREBASE_SETUP.md を読んでください

export const firebaseConfig = {
  apiKey: "AIzaSyDPh8kYoksbFtQEsfm4vnir-8Qg8yNHTf8",
  authDomain: "memo-5ffec.firebaseapp.com",
  projectId: "memo-5ffec",
  storageBucket: "memo-5ffec.firebasestorage.app",
  messagingSenderId: "357043391177",
  appId: "1:357043391177:web:1024b9acec942d1428db18",
  measurementId: "G-4KG4NWGMGW"
};

export function isFirebaseConfigured() {
  return !Object.values(firebaseConfig).some(
    (value) => typeof value === "string" && value.startsWith("YOUR_"),
  );
}
