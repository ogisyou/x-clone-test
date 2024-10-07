// firebaseAdmin.ts
import * as admin from "firebase-admin";
import * as dotenv from "dotenv";

// 環境変数を読み込む
dotenv.config();
console.log("MY_FIREBASE_PROJECT_ID:", process.env.MY_FIREBASE_PROJECT_ID);


// Firebase Admin SDKの初期化
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.MY_FIREBASE_PROJECT_ID || "",
        clientEmail: process.env.MY_FIREBASE_CLIENT_EMAIL || "",
        // 環境変数から改行を正しく扱うための修正
        privateKey: process.env.MY_FIREBASE_PRIVATE_KEY ?
          process.env.MY_FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n") :
          undefined,
      }),
    });
  } catch (error) {
    console.error("Firebase初期化エラー:", error);
    throw new Error("Firebase Admin SDKの初期化に失敗しました");
  }
}

const db = admin.firestore();
const auth = admin.auth();

export {admin, db, auth};
