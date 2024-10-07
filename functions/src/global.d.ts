// グローバル型定義ファイル (global.d.ts)
declare namespace NodeJS {
  interface ProcessEnv {
    MY_FIREBASE_PROJECT_ID: string;
    MY_FIREBASE_CLIENT_EMAIL: string;
    MY_FIREBASE_PRIVATE_KEY: string;
    NEXT_PUBLIC_FIREBASE_API_KEY: string;
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: string;
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: string;
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: string;
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: string;
    NEXT_PUBLIC_FIREBASE_APP_ID: string;
  }
}
