// app/firebase.ts
import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";
import { getStorage, FirebaseStorage } from "firebase/storage";


const firebaseConfig = process.env.FIREBASE_CONFIG
  ? JSON.parse(process.env.FIREBASE_CONFIG)
  : {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    };

let app: FirebaseApp | undefined;
let auth: Auth | undefined;
let db: Firestore | undefined;
let storage: FirebaseStorage | undefined;
let provider: GoogleAuthProvider | undefined;

try {
  if (typeof window !== "undefined") {
    app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);
    provider = new GoogleAuthProvider();
    console.log("Firebaseの初期化が完了しました:", !!app);
  } else {
    console.log("Firebaseの初期化をスキップしました（サーバーサイド）");
  }
} catch (error) {
  console.error("Firebaseの初期化中にエラーが発生しました:", error);
}


function isInitialized(app: FirebaseApp | undefined): app is FirebaseApp {
  return typeof window !== "undefined" && app !== undefined;
}


function getFirebaseServices() {
  if (!isInitialized(app)) {
    throw new Error("Firebaseが初期化されていません");
  }
  return { app, auth: auth!, db: db!, storage: storage!, provider: provider! };
}

export { auth, storage, db, getFirebaseServices, provider };