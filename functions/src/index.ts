import * as functions from "firebase-functions";
import {initializeApp, getApps, cert} from "firebase-admin/app";
import {getFirestore} from "firebase-admin/firestore";
import {getAuth} from "firebase-admin/auth";

// Firebase Admin SDKの初期化
if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
  });
}

const db = getFirestore();
const auth = getAuth();

export const deleteUser = functions.https.onRequest(async (req, res) => {
  // CORSヘッダーの設定
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.set("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.status(204).send("");
    return;
  }

  if (req.method !== "POST") {
    res.status(405).json({message: "Method Not Allowed"});
    return;
  }

  const {uid} = req.body;

  if (!uid) {
    res.status(400).json({message: "User ID is required"});
    return;
  }

  try {
    // Firestoreからユーザーデータを削除
    await db.collection("users").doc(uid).delete();

    // ユーザーの投稿を削除
    const postsSnapshot = await db
      .collection("posts")
      .where("uid", "==", uid)
      .get();
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
