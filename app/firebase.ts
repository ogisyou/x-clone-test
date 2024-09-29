import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage"; 

// 環境変数を使ってFirebaseの設定
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Firebaseの初期化をクライアントサイドでのみ実行
let app;
if (typeof window !== "undefined") {
  if (!getApps().length) {
    app = initializeApp(firebaseConfig);
    console.log("Firebase initialized:", app);
  } else {
    app = getApp(); // 既に初期化されている場合はそれを使用
  }
}

// 初期化確認用のコンソールログ
console.log("Firebase initialized:", app);

// Firebaseの認証とデータベースのインスタンス（クライアントサイドのみ利用）
export const auth = app ? getAuth(app) : null;
export const db = app ? getFirestore(app) : null;
export const storage = app ? getStorage(app) : null;

// Google認証用のプロバイダーをエクスポート（クライアントサイドのみ）
export const provider = app ? new GoogleAuthProvider() : null;
