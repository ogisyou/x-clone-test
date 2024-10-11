import express from "express";
import * as functions from "firebase-functions";
import cors from "cors";
import {auth, db, FieldValue} from "./firebaseAdmin";

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

    // 削除するユーザーのデータを取得
    const userDoc = await db.collection("users").doc(uid).get();
    const userData = userDoc.data();

    if (userData) {
      // フォロワーのデータを更新
      const followers = userData.followers || [];
      for (const followerId of followers) {
        await db.collection("users").doc(followerId).update({
          following: FieldValue.arrayRemove(uid),
        });
      }

      // フォロー中のユーザーのデータを更新
      const following = userData.following || [];
      for (const followingId of following) {
        await db.collection("users").doc(followingId).update({
          followers: FieldValue.arrayRemove(uid),
        });
      }
    }

    // ユーザーの認証情報を削除
    await auth.deleteUser(uid);

    // ユーザードキュメントを削除
    await db.collection("users").doc(uid).delete();

    // ユーザーの投稿を削除
    const userPostsSnapshot = await db.collection("posts").where("profileUid", "==", uid).get();
    const deletePromises = userPostsSnapshot.docs.map((doc) => doc.ref.delete());
    await Promise.all(deletePromises);

    console.log(`ゲストユーザー ${uid} 、投稿、関連データが正常に削除されました`);
    res.status(200).json({message: "ユーザーが正常に削除されました"});
  } catch (error) {
    console.error("エラー:", error);
    if (error instanceof Error) {
      res.status(500).json({message: "サーバー内部エラー", error: error.message});
    } else {
      res.status(500).json({message: "サーバー内部エラー"});
    }
  }
};

app.post("/deleteUser", deleteUserHandler);

export const deleteUser = functions.https.onRequest(app);
