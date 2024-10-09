import express, {Request, Response} from "express";
import * as functions from "firebase-functions";
import cors from "cors";
import * as admin from "firebase-admin";

admin.initializeApp();

const app = express();
app.use(cors({origin: true}));
app.use(express.json());

app.post("/deleteUser", async (req: Request, res: Response) => {
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
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    console.log("デコードされたトークン:", decodedToken);

    const {uid} = req.body;
    if (!uid) {
      return res.status(400).json({message: "ユーザーIDが必要です"});
    }

    // ユーザーの削除処理
    await admin.auth().deleteUser(uid);
    await admin.firestore().collection("users").doc(uid).delete();

    console.log(`ユーザー ${uid} が正常に削除されました`);
    return res.status(200).json({message: "ユーザーが正常に削除されました"});
  } catch (error) {
    console.error("エラー:", error);
    if (error instanceof Error) {
      return res
        .status(500)
        .json({message: "サーバー内部エラー", error: error.message});
    }
    return res.status(500).json({message: "サーバー内部エラー"});
  }
});

export const api = functions.https.onRequest((req: Request, res: Response) => {
  return app(req, res);
});

if (process.env.NODE_ENV !== "production") {
  const port = process.env.PORT || 8080;
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
  // アプリケーションをクラッシュさせる代わりに、ここでエラーを適切に処理します
});
