// src/contexts/BackgroundContext.tsx
import React, { createContext, useState, useContext, ReactNode } from 'react';

// Contextの型を定義
interface BackgroundContextType {
  backgroundURL: string | null; // URLは文字列またはnull
  setBackgroundURL: React.Dispatch<React.SetStateAction<string | null>>; // setStateの型
}

// Contextの作成
const BackgroundContext = createContext<BackgroundContextType | undefined>(undefined);

// Contextプロバイダーの作成
export const BackgroundProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [backgroundURL, setBackgroundURL] = useState<string | null>(null);

  return (
    <BackgroundContext.Provider value={{ backgroundURL, setBackgroundURL }}>
      {children}
    </BackgroundContext.Provider>
  );
};

// Contextを使用するためのカスタムフック
export const useBackground = (): BackgroundContextType => {
  const context = useContext(BackgroundContext);
  if (context === undefined) {
    throw new Error('useBackgroundはBackgroundProvider内で使用する必要があります');
  }
  return context;
};
