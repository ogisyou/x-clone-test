// index.ts
import * as functions from "firebase-functions";
import cors from "cors";
import {db, auth} from "./firebaseAdmin";


// CORS設定
const corsHandler = cors({origin: true, credentials: true});

// ユーザー削除関数
export const deleteUser = functions.https.onRequest((req, res) => {
  return corsHandler(req, res, async () => {
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
      const postsSnapshot = await db.collection("posts").where("uid", "==", uid).get();
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
        console.error("エラースタック:", error.stack);
        res.status(500).json({message: "ユーザー削除エラー", error: error.message, stack: error.stack});
      } else {
        res.status(500).json({message: "ユーザー削除エラー", error: "不明なエラーが発生しました"});
      }
    }
  });
});

// 環境変数のロード確認（デバッグ用）
console.log("環境変数の確認:");
console.log("MY_FIREBASE_PROJECT_ID:", process.env.MY_FIREBASE_PROJECT_ID);
console.log("MY_FIREBASE_CLIENT_EMAIL:", process.env.MY_FIREBASE_CLIENT_EMAIL);
console.log("MY_FIREBASE_PRIVATE_KEY設定:", !!process.env.MY_FIREBASE_PRIVATE_KEY);
