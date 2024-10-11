// functions/src/firebaseAdmin.ts

import * as admin from "firebase-admin";
import * as dotenv from "dotenv";

// .env ファイルから環境変数を読み込む
dotenv.config();

const projectId = process.env.MY_FIREBASE_PROJECT_ID;
const clientEmail = process.env.MY_FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.MY_FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

console.log("環境変数の確認(firebaseAdmin.ts):");
console.log("MY_FIREBASE_PROJECT_ID:", projectId);
console.log("MY_FIREBASE_CLIENT_EMAIL:", clientEmail);
console.log("MY_FIREBASE_PRIVATE_KEY is set:", !!privateKey);

if (!admin.apps.length) {
  try {
    const serviceAccount = {
      projectId,
      clientEmail,
      privateKey,
    };

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
    });
    console.log("Firebase Admin SDK initialized successfully");
  } catch (error) {
    console.error("Firebase初期化エラー:", error);
    throw new Error("Firebase Admin SDKの初期化に失敗しました");
  }
}

export const db = admin.firestore();
export const auth = admin.auth();
export const FieldValue = admin.firestore.FieldValue;
export {admin};
