// functions/src/index.ts
import express from "express";
import * as functions from "firebase-functions";
import cors from "cors";
import {db, auth, FieldValue} from "./firebaseAdmin";

const app = express();

const corsOptions = {
  origin: true,
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());

app.get("/", (req, res) => {
  res.status(200).send("API is running");
});

const deleteUserHandler: express.RequestHandler = async (req, res) => {
  try {
    console.log("リクエストヘッダー:", req.headers);
    console.log("リクエストボディ:", req.body);

    const authHeader = req.get("Authorization");
    if (!authHeader) {
      res.status(401).json({message: "認証ヘッダーがありません"});
      return;
    }

    const idToken = authHeader.split("Bearer ")[1];
    if (!idToken) {
      res.status(401).json({message: "無効な認証ヘッダーの形式です"});
      return;
    }

    const decodedToken = await auth.verifyIdToken(idToken);
    console.log("デコードされたトークン:", decodedToken);

    const {uid} = req.body;
    if (!uid) {
      res.status(400).json({message: "ユーザーIDが必要です"});
      return;
    }

    console.log(`ユーザー削除処理開始: ${uid}`);

    await db.runTransaction(async (transaction) => {
      const userRef = db.collection("users").doc(uid);
      const userDoc = await transaction.get(userRef);
      if (!userDoc.exists) {
        console.log(`ユーザー ${uid} が見つかりません`);
        throw new Error("ユーザーが見つかりません");
      }
      const userData = userDoc.data();
      transaction.delete(userRef);
      console.log(`ユーザードキュメントを削除しました: ${uid}`);

      const followers = userData?.followers || [];
      const following = userData?.following || [];
      [...followers, ...following].forEach((relatedUserId) => {
        const relatedUserRef = db.collection("users").doc(relatedUserId);
        transaction.update(relatedUserRef, {
          followers: FieldValue.arrayRemove(uid),
          following: FieldValue.arrayRemove(uid),
        });
      });
      console.log(
        `${followers.length} 人のフォロワーと ${following.length} 人のフォロー中ユーザーデータを更新しました`
      );


      const postsRef = db.collection("posts");
      const likedPostsSnapshot = await postsRef.get();
      console.log(`取得した投稿数: ${likedPostsSnapshot.size}`);

      const batchSize = 500;
      let batch = db.batch();
      let operationCount = 0;


      for (const postDoc of likedPostsSnapshot.docs) {
        const postRef = postDoc.ref;
        const likeRef = postRef.collection("likes").doc(uid);

        const likeDoc = await likeRef.get();
        if (likeDoc.exists) {
          batch.delete(likeRef);
          batch.update(postRef, {
            likeCount: FieldValue.increment(-1),
          });

          operationCount++;
          if (operationCount === batchSize) {
            await batch.commit();
            batch = db.batch();
            operationCount = 0;
          }
        }
      }

      if (operationCount > 0) {
        await batch.commit();
      }

      console.log("投稿のサブコレクションからいいねを削除しました");

      const userPostsSnapshot = await postsRef.where("uid", "==", uid).get();

      batch = db.batch();
      operationCount = 0;

      for (const doc of userPostsSnapshot.docs) {
        const postRef = doc.ref;
        const likesSnapshot = await postRef.collection("likes").get();
        likesSnapshot.docs.forEach((likeDoc) => {
          batch.delete(likeDoc.ref);
        });
        batch.delete(postRef);

        operationCount++;
        if (operationCount === batchSize) {
          await batch.commit();
          batch = db.batch();
          operationCount = 0;
        }

        console.log(`投稿 ${doc.id} とそのいいねを削除しました`);
      }

      if (operationCount > 0) {
        await batch.commit();
      }

      console.log(`${userPostsSnapshot.size} 件のユーザー投稿を削除しました`);
    });

    await auth.deleteUser(uid);
    console.log(`ユーザーの認証情報を削除しました: ${uid}`);

    console.log(
      `ユーザー ${uid} 、投稿、いいね、関連データが正常に削除されました`
    );
    res.status(200).json({message: "ユーザーが正常に削除されました"});
  } catch (error) {
    console.error("エラー:", error);
    if (error instanceof Error) {
      console.error("エラーメッセージ:", error.message);
      console.error("スタックトレース:", error.stack);
    }
    res.status(500).json({
      message: "サーバー内部エラー",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

app.post("/deleteUser", deleteUserHandler);

export const deleteUser = functions.https.onRequest(app);
