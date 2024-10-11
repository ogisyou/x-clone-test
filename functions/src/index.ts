// functions/src/index.ts

import express from "express";
import * as functions from "firebase-functions";
import cors from "cors";
import {auth, db} from "./firebaseAdmin";

const app = express();

const corsOptions = {
  origin: true,
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());

// ルートパスのハンドラー
app.get("/", (req, res) => {
  res.status(200).send("API is running");
});

app.post("/deleteUser", async (req, res) => {
  console.log("リクエストヘッダー:", req.headers);
  console.log("リクエストボディ:", req.body);

  const authHeader = req.get("Authorization");
  if (!authHeader) {
    return res.status(401).json({message: "認証ヘッダーがありません"});
  }

  const idToken = authHeader.split("Bearer ")[1];
  if (!idToken) {
    return res.status(401).json({message: "無効な認証ヘッダーの形式です"});
  }

  try {
    const decodedToken = await auth.verifyIdToken(idToken);
    console.log("デコードされたトークン:", decodedToken);

    const {uid} = req.body;
    if (!uid) {
      return res.status(400).json({message: "ユーザーIDが必要です"});
    }

    await auth.deleteUser(uid);
    await db.collection("users").doc(uid).delete();

    // ユーザーの投稿データ削除 (posts コレクション)
    const userPostsSnapshot = await db.collection("posts").where("uid", "==", uid).get();
    const deletePromises = userPostsSnapshot.docs.map((doc) => doc.ref.delete());
    await Promise.all(deletePromises);

    console.log(`ユーザー ${uid} および関連する投稿が正常に削除されました`);
    return res.status(200).json({message: "ユーザーが正常に削除されました"});
  } catch (error) {
    console.error("エラー:", error);
    if (error instanceof Error) {
      return res.status(500).json({message: "サーバー内部エラー", error: error.message});
    }
    return res.status(500).json({message: "サーバー内部エラー"});
  }
});

export const deleteUser = functions.https.onRequest(app);