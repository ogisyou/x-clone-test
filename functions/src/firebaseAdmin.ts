import * as admin from "firebase-admin";
import * as dotenv from "dotenv";

if (process.env.NODE_ENV !== "production") {
  dotenv.config();
}

console.log("環境変数の確認(firebaseAdmin.ts):");
console.log("MY_FIREBASE_PROJECT_ID:", process.env.MY_FIREBASE_PROJECT_ID);
console.log("MY_FIREBASE_CLIENT_EMAIL:", process.env.MY_FIREBASE_CLIENT_EMAIL);
console.log("MY_FIREBASE_PRIVATE_KEY is set:", !!process.env.MY_FIREBASE_PRIVATE_KEY);

if (!admin.apps.length) {
  try {
    const serviceAccount = {
      projectId: process.env.MY_FIREBASE_PROJECT_ID,
      clientEmail: process.env.MY_FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.MY_FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
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
export {admin};
