import cors from "cors"; // 修正: デフォルトインポートを使用
import * as admin from "firebase-admin";
import { getFirestore } from "firebase-admin/firestore";
import { onRequest } from "firebase-functions/v2/https";
import { logger } from "firebase-functions";

// Firebase Admin SDKの初期化
admin.initializeApp();

// Firestoreのインスタンスを取得
const db = getFirestore();

// CORS設定
const corsOptions = {
  origin: ["http://localhost:3000", "http://localhost:3001"], // 許可するオリジンを配列で指定
};

// CORSミドルウェアを設定
const corsMiddleware = cors(corsOptions);

// ユーザー削除関数
export const deleteUser = onRequest(async (request, response) => {
  corsMiddleware(request, response, async () => {
    const uid = request.body.uid;

    if (!uid) {
      logger.error("UIDが必要です");
      return response.status(400).send("UIDが必要です");
    }

    try {
      // Firestoreからユーザーデータを削除
      await db.collection("users").doc(uid).delete();
      logger.info(`ユーザーデータがFirestoreから削除されました: UID = ${uid}`);

      // そのユーザーの投稿も削除
      const postsSnapshot = await db.collection("posts")
        .where("uid", "==", uid).get();
      const batch = db.batch();

      postsSnapshot.docs.forEach((doc) => {
        logger.info(`投稿を削除します: UID = ${uid}, 投稿ID = ${doc.id}`);
        batch.delete(doc.ref);
      });

      await batch.commit();
      logger.info(`ユーザーの全投稿が削除されました: UID = ${uid}`);

      // Firebase Authからユーザーを削除
      await admin.auth().deleteUser(uid);
      logger.info(`ユーザーがFirebase Authから削除されました: UID = ${uid}`);

      return response.status(200).send(`ユーザーが正常に削除されました: UID = ${uid}`);
    } catch (error: unknown) {
      if (error instanceof Error) {
        logger.error(`ユーザー削除エラー: ${error.message}`);
        return response.status(500).send(`ユーザー削除エラー: ${error.message}`);
      } else {
        logger.error("ユーザー削除エラー: 不明なエラー");
        return response.status(500).send("ユーザー削除エラー: 不明なエラー");
      }
    }
  });
});
