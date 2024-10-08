import * as admin from "firebase-admin";

// GitHub Actions環境でない場合のみdotenvを使用
if (process.env.GITHUB_ACTIONS !== "true") {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const dotenv = require("dotenv");
  dotenv.config();
}

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

const db = admin.firestore();
const auth = admin.auth();

export {admin, db, auth};