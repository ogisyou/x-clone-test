// AvatarContext.tsx
import React, { createContext, useState, useContext, ReactNode } from 'react';

// Contextの型定義
interface AvatarContextType {
  avatar: string;
  setAvatar: React.Dispatch<React.SetStateAction<string>>;
}

// Contextの作成
const AvatarContext = createContext<AvatarContextType | undefined>(undefined);

// Contextプロバイダーの型定義
interface AvatarProviderProps {
  children: ReactNode;
}

// Contextプロバイダーの作成
export const AvatarProvider: React.FC<AvatarProviderProps> = ({ children }) => {
  const [avatar, setAvatar] = useState<string>('');

  return (
    <AvatarContext.Provider value={{ avatar, setAvatar }}>
      {children}
    </AvatarContext.Provider>
  );
};

// Contextを使用するためのカスタムフック
export const useAvatar = (): AvatarContextType => {
  const context = useContext(AvatarContext);
  if (!context) {
    throw new Error('useAvatar must be used within an AvatarProvider');
  }
  return context;
};
