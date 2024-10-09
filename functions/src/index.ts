import * as functions from "firebase-functions";
import cors from "cors";
import {db, auth} from "./firebaseAdmin";

// CORS設定
const corsHandler = cors({
  origin: true,
  methods: ["POST", "OPTIONS"],
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization"],
});

// ユーザー削除関数
export const deleteUser = functions.https.onRequest((req, res) => {
  return corsHandler(req, res, async () => {
    console.log("リクエストヘッダー:", req.headers);
    console.log("認証情報:", req.get("Authorization"));

    if (req.method === "OPTIONS") {
      res.status(204).send("");
      return;
    }

    if (req.method !== "POST") {
      res.status(405).json({message: "許可されていないメソッドです"});
      return;
    }

    const authHeader = req.get("Authorization");
    if (!authHeader) {
      res.status(401).json({message: "認証情報が不足しています"});
      return;
    }

    try {
      const token = authHeader.split("Bearer ")[1];
      await auth.verifyIdToken(token);
    } catch (error) {
      console.error("トークン検証エラー:", error);
      res.status(401).json({message: "無効な認証トークンです"});
      return;
    }

    const {uid} = req.body;

    if (!uid) {
      res.status(400).json({message: "ユーザーIDが必要です"});
      return;
    }

    try {
      console.log("Firestoreとの接続を確認中...");
      await db.collection("users").doc(uid).get();
      console.log("Firestore接続成功");

      await db.collection("users").doc(uid).delete();

      const postsSnapshot = await db.collection("posts").where("uid", "==", uid).get();
      const batch = db.batch();
      postsSnapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
      });
      await batch.commit();

      await auth.deleteUser(uid);

      res.status(200).json({message: "ユーザーが正常に削除されました"});
    } catch (error) {
      console.error("詳細なエラー情報:", error);
      if (error instanceof Error) {
        console.error("エラースタック:", error.stack);
        res.status(500).json({
          message: "ユーザー削除エラー",
          error: error.message,
          stack: error.stack,
        });
      } else {
        res.status(500).json({
          message: "ユーザー削除エラー",
          error: "不明なエラーが発生しました",
        });
      }
    }
  });
});

// 環境変数のロード確認（デバッグ用）
console.log("環境変数の確認:");
console.log("MY_FIREBASE_PROJECT_ID:", process.env.MY_FIREBASE_PROJECT_ID);
console.log("MY_FIREBASE_CLIENT_EMAIL:", process.env.MY_FIREBASE_CLIENT_EMAIL);
console.log("MY_FIREBASE_PRIVATE_KEY設定:", !!process.env.MY_FIREBASE_PRIVATE_KEY);
