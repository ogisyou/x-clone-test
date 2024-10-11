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

    await auth.deleteUser(uid);
    await db.collection("users").doc(uid).delete();

    const userPostsSnapshot = await db.collection("posts").where("profileUid", "==", uid).get();
    const deletePromises = userPostsSnapshot.docs.map((doc) => doc.ref.delete());
    await Promise.all(deletePromises);

    console.log(`ゲストユーザー ${uid} 、投稿が正常に削除されました`);
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
