// AvatarContext.js
import React, { createContext, useState, useContext } from 'react';

// Contextの作成
const AvatarContext = createContext();

// Contextプロバイダーの作成
export const AvatarProvider = ({ children }) => {
  const [avatar, setAvatar] = useState('');

  return (
    <AvatarContext.Provider value={{ avatar, setAvatar }}>
      {children}
    </AvatarContext.Provider>
  );
};

// Contextを使用するためのカスタムフック
export const useAvatar = () => useContext(AvatarContext);
