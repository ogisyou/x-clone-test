// app/contexts/AuthContext.tsx
import { createContext, useContext, useState, ReactNode } from 'react';

interface AuthContextProps {
  isAuth: boolean;
  setIsAuth: (value: boolean) => void;
  uid: string | null;
  setUid: (value: string | null) => void;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuth, setIsAuth] = useState(false);
  const [uid, setUid] = useState<string | null>(null);

  return (
    <AuthContext.Provider value={{ isAuth, setIsAuth, uid, setUid }}>
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
