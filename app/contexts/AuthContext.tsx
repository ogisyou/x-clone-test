'use client';
import React, { createContext, useContext, useState } from 'react';

// User 型を定義
interface User {
  id: string; // ユーザーID
  name: string; // ユーザー名
  email?: string; // メールアドレス（オプション）
  // 他のプロパティを必要に応じて追加
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null; // User型またはnullを許容
  login: (user: User) => void; // ログイン関数（User型を受け取る）
  logout: () => void; // ログアウト関数
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null); // User型またはnullを許容

  const login = (user: User) => {
    setIsAuthenticated(true);
    setUser(user);
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
