import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import cors from "cors";

// Firebase Admin SDKの初期化
admin.initializeApp();
console.log("Firebase Admin初期化完了");

const db = admin.firestore();
const auth = admin.auth();

// CORS設定
const corsHandler = cors({
  origin: [
    "https://x-clone-test-a9d8yq4mp-ogisyous-projects.vercel.app",
    "https://x-clone-test2.web.app",
    "http://localhost:3000",
  ],
  credentials: true,
});

// ユーザー削除関数
export const deleteUser = functions.https.onRequest((req, res) => {
  return corsHandler(req, res, async () => {
    console.log("環境変数確認:");
    console.log("NODE_ENV:", process.env.NODE_ENV);
    console.log("MY_FIREBASE_PROJECT_ID:", process.env.MY_FIREBASE_PROJECT_ID);
    console.log("MY_FIREBASE_CLIENT_EMAIL設定:", !!process.env.MY_FIREBASE_CLIENT_EMAIL);
    console.log("MY_FIREBASE_PRIVATE_KEY設定:", !!process.env.MY_FIREBASE_PRIVATE_KEY);

    console.log("リクエストメソッド:", req.method);
    console.log("リクエストヘッダー:", req.headers);
    console.log("リクエストボディ:", req.body);

    // POSTリクエスト以外は拒否
    if (req.method !== "POST") {
      res.status(405).json({message: "許可されていないメソッドです"});
      return;
    }

    const {uid} = req.body;

    // UIDが提供されていない場合はエラー
    if (!uid) {
      res.status(400).json({message: "ユーザーIDが必要です"});
      return;
    }

    try {
      // Firestoreからユーザーデータを削除
      await db.collection("users").doc(uid).delete();

      // ユーザーの投稿を削除
      const postsSnapshot = await db.collection("posts").
        where("uid", "==", uid).get();
      const batch = db.batch();
      postsSnapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
      });
      await batch.commit();

      // Firebase Authからユーザーを削除
      await auth.deleteUser(uid);

      res.status(200).json({message: "ユーザーが正常に削除されました"});
    } catch (error) {
      console.error("ユーザー削除エラー:", error);
      if (error instanceof Error) {
        console.error("エラーの詳細:", error.stack);
        res.status(500).json({message: "ユーザー削除エラー", error: error.message, stack: error.stack});
      } else {
        console.error("不明なエラー:", error);
        res.status(500).json({message: "ユーザー削除エラー", error: "不明なエラーが発生しました"});
      }
    }
  });
});

// 環境変数のロード確認
console.log("読み込まれた環境変数:");
console.log("MY_FIREBASE_PROJECT_ID:", process.env.MY_FIREBASE_PROJECT_ID);
console.log("MY_FIREBASE_CLIENT_EMAIL:", process.env.MY_FIREBASE_CLIENT_EMAIL);
console.log("MY_FIREBASE_PRIVATE_KEY設定:", !!process.env.MY_FIREBASE_PRIVATE_KEY);
