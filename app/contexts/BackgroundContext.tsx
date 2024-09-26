// src/contexts/BackgroundContext.tsx
import React, { createContext, useState, useContext, ReactNode } from 'react';

// 背景URLの型を定義
interface BackgroundURL {
  url: string; // 実際のURL
  description?: string; // 説明などのオプションプロパティ
}

// Contextの型を定義（背景URLオブジェクトの配列）
type BackgroundContextType = [BackgroundURL[], React.Dispatch<React.SetStateAction<BackgroundURL[]>>];

// Contextの作成
const BackgroundContext = createContext<BackgroundContextType | undefined>(undefined);

// Contextプロバイダーの作成
export const BackgroundProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // 初期値は空の配列
  const [backgroundURLs, setBackgroundURLs] = useState<BackgroundURL[]>([]);

  return (
    <BackgroundContext.Provider value={[backgroundURLs, setBackgroundURLs]}>
      {children}
    </BackgroundContext.Provider>
  );
};

// Contextを使用するためのカスタムフック
export const useBackground = (): BackgroundContextType => {
  const context = useContext(BackgroundContext);
  
  // コンテキストが未定義の場合、エラーをスロー
  if (context === undefined) {
    throw new Error('useBackgroundはBackgroundProvider内で使用する必要があります');
  }

  return context; // 変更後、配列を返す
};
