import * as dotenv from "dotenv";
import * as path from "path";
import * as fs from "fs";
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import cors from "cors"; // 修正: シングルクォートをダブルクォートに変更

// .envファイルのパスを明示的に設定
const envPath = path.resolve(__dirname, "../.env");
console.log(".envファイルの読み込みを試みます:", envPath);

// ファイルの存在確認
if (fs.existsSync(envPath)) {
  console.log(".envファイルが存在します");

  // ファイルの内容を読み取る
  try {
    const envContents = fs.readFileSync(envPath, "utf8");
    console.log(".envファイルの内容（最初の100文字）:", envContents
      .substring(0, 100));
  } catch (error) {
    console.error(".envファイルの読み取りエラー:", error);
  }

  // .envファイルを読み込む
  const result = dotenv.config({path: envPath});

  if (result.error) {
    console.error(".envファイルの読み込みエラー:", result.error);
  } else {
    console.log(".envファイルが正常に読み込まれました");
  }
} else {
  console.error(".envファイルが次のパスに存在しません:", envPath);
}

// Firebase Admin SDKの初期化
admin.initializeApp();

// デバッグ情報をログに出力
console.log("現在の環境:", process.env.NODE_ENV);
console.log("現在の作業ディレクトリ:", process.cwd());
console.log("MY_FIREBASE_PROJECT_ID:", process.env.MY_FIREBASE_PROJECT_ID);
console.log("MY_FIREBASE_CLIENT_EMAIL:", process.env.MY_FIREBASE_CLIENT_EMAIL);
console.log("MY_FIREBASE_PRIVATE_KEY設定:", !!process.env.MY_FIREBASE_PRIVATE_KEY);

const db = admin.firestore();
const auth = admin.auth();

// CORS設定
const corsHandler = cors({
  origin: true, 
  credentials: true,
});

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
        res.status(500).json({message: "ユーザー削除エラー", error: error.message});
      } else {
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
