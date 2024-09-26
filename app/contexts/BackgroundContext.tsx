// src/contexts/BackgroundContext.tsx
import React, { createContext, useState, useContext, ReactNode } from 'react';

// 背景URLの型を定義
interface BackgroundURL {
  url: string; // 実際のURL
  description?: string; // 説明などのオプションプロパティ
}

// Contextの型を定義（オブジェクト型の配列）
interface BackgroundContextType {
  backgroundURLs: BackgroundURL[]; // URLはオブジェクトの配列
  setBackgroundURLs: React.Dispatch<React.SetStateAction<BackgroundURL[]>>; // setStateの型
}

// Contextの作成
const BackgroundContext = createContext<BackgroundContextType | undefined>(undefined);

// Contextプロバイダーの作成
export const BackgroundProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // 初期値は空の配列
  const [backgroundURLs, setBackgroundURLs] = useState<BackgroundURL[]>([]);

  return (
    <BackgroundContext.Provider value={{ backgroundURLs, setBackgroundURLs }}>
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

  return context;
};
