import '@testing-library/jest-dom';

// Firebaseのモック（必要に応じて）
jest.mock('firebase/app', () => ({
  initializeApp: jest.fn(),
}));

jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(),
}));

// 他の必要なモックやグローバル設定をここに追加