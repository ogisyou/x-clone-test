import * as dotenv from "dotenv";
import * as path from "path";
import * as fs from "fs";

// Explicitly set the path to the .env file
const envPath = path.resolve(__dirname, "../.env");
console.log("Attempting to load .env file from:", envPath);

// Check if the file exists
if (fs.existsSync(envPath)) {
  console.log(".env file exists");

  // Try to read the file contents
  try {
    const envContents = fs.readFileSync(envPath, "utf8");
    console.log(".env file contents (first 100 chars):", envContents
      .substring(0, 100));
  } catch (error) {
    console.error("Error reading .env file:", error);
  }

  // Try to load the .env file
  const result = dotenv.config({path: envPath});

  if (result.error) {
    console.error("Error loading .env file:", result.error);
  } else {
    console.log(".env file loaded successfully");
  }
} else {
  console.error(".env file does not exist at path:", envPath);
}

import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

// Firebase Admin SDKの初期化
admin.initializeApp();

// デバッグ情報をログに出力
console.log("Current environment:", process.env.NODE_ENV);
console.log("Current working directory:", process.cwd());
console.log("FIREBASE_PROJECT_ID:", process.env.FIREBASE_PROJECT_ID);
console.log("FIREBASE_CLIENT_EMAIL:", process.env.FIREBASE_CLIENT_EMAIL);
console.log("FIREBASE_PRIVATE_KEY set:", !!process.env.FIREBASE_PRIVATE_KEY);

// ... (残りのコードは変更なし)

const db = admin.firestore();
const auth = admin.auth();

// ユーザー削除関数
export const deleteUser = functions.https.onRequest(async (req, res) => {
  // CORSヘッダーの設定
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.set("Access-Control-Allow-Headers", "Content-Type");

  // OPTIONSリクエストの処理
  if (req.method === "OPTIONS") {
    res.status(204).send("");
    return;
  }

  // POSTリクエスト以外は拒否
  if (req.method !== "POST") {
    res.status(405).json({message: "Method Not Allowed"});
    return;
  }

  const {uid} = req.body;

  // UIDが提供されていない場合はエラー
  if (!uid) {
    res.status(400).json({message: "User ID is required"});
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

    res.status(200).json({message: "User deleted successfully"});
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({message: "Error deleting user"});
  }
});
