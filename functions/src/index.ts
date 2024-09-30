import cors from "cors";
import * as admin from "firebase-admin";
import {getFirestore} from "firebase-admin/firestore";
import {onRequest} from "firebase-functions/v2/https";
import {logger} from "firebase-functions";

// Firebase Admin SDKの初期化
admin.initializeApp();

// Firestoreのインスタンスを取得
const db = getFirestore();

// CORS設定
const corsOptions = {
  origin: true, // すべてのオリジンを許可。本番環境では適切に制限してください。
  methods: ["POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};

// CORSミドルウェアの初期化
const corsMiddleware = cors(corsOptions);

// ユーザー削除関数
export const deleteUser = onRequest(async (request, response) => {
  return new Promise((resolve) => {
    corsMiddleware(request, response, async () => {
      const uid = request.body.uid;

      // UIDの検証
      if (!uid) {
        logger.error("UIDが必要です");
        response.status(400).send("UIDが必要です");
        return resolve();
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

        response.status(200).send(`ユーザーが正常に削除されました: UID = ${uid}`);
        return resolve();
      } catch (error: unknown) {
        // エラーハンドリング
        const errorMessage = error instanceof Error ? error.message : "不明なエラー";
        logger.error(`ユーザー削除エラー: ${errorMessage}`);
        response.status(500).send(`ユーザー削除エラー: ${errorMessage}`);
        return resolve();
      }
    });
  });
});