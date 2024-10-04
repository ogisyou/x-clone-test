import '@testing-library/jest-dom';

// Firebase のモック
jest.mock('firebase/app', () => ({
  initializeApp: jest.fn(),
}));

jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(),
}));

// グローバルなモックや設定を追加
global.fetch = jest.fn();
global.console = {
  ...console,
  error: jest.fn(),
  warn: jest.fn(),
  log: jest.fn(),
};

// テスト環境のクリーンアップ
afterEach(() => {
  jest.clearAllMocks();
});