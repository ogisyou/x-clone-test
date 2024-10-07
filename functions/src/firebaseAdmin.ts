import * as admin from "firebase-admin";

// dotenvのインポートを条件付きで動的に行う
const initializeDotenv = async () => {
  if (process.env.NODE_ENV !== "production") {
    const dotenv = await import("dotenv");
    dotenv.config();
  }
};

// Firebase Admin SDKの初期化をラップして非同期処理にする
const initializeFirebase = async () => {
  // dotenvの初期化
  await initializeDotenv();

  // 環境変数のデバッグ出力
  console.log("環境変数:");
  console.log("MY_FIREBASE_PROJECT_ID:", process.env.MY_FIREBASE_PROJECT_ID);
  console.log("MY_FIREBASE_CLIENT_EMAIL:", process.env.MY_FIREBASE_CLIENT_EMAIL);
  console.log("MY_FIREBASE_PRIVATE_KEY length:", process.env.MY_FIREBASE_PRIVATE_KEY ?
    process.env.MY_FIREBASE_PRIVATE_KEY.length : "undefined");

  // Firebase Admin SDKの初期化
  if (!admin.apps.length) {
    try {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.MY_FIREBASE_PROJECT_ID,
          clientEmail: process.env.MY_FIREBASE_CLIENT_EMAIL,
          // 環境変数から改行を正しく扱うための修正
          privateKey: process.env.MY_FIREBASE_PRIVATE_KEY ?
            process.env.MY_FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n") :
            undefined,
        }),
      });
      console.log("Firebase Admin SDK initialized successfully");
    } catch (error) {
      console.error("Firebase初期化エラー:", error);
      throw new Error("Firebase Admin SDKの初期化に失敗しました");
    }
  }
};

// 初期化を呼び出し
initializeFirebase();

const db = admin.firestore();
const auth = admin.auth();

export {admin, db, auth};
