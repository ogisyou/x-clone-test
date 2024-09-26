// app/contexts/AuthContext.tsx
import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

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
  const auth = getAuth();

  useEffect(() => {
    // ユーザーの認証状態を監視
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // ユーザーがログインしている場合
        setIsAuth(true);
        setUid(user.uid);
        console.log('ユーザーがログインしました:', user.uid);
      } else {
        // ユーザーがログアウトしている場合
        setIsAuth(false);
        setUid(null);
        console.log('ユーザーがログアウトしました');
      }
    });

    // クリーンアップ関数
    return () => unsubscribe();
  }, [auth]);

  return (
    <AuthContext.Provider value={{ isAuth, setIsAuth, uid, setUid }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthはAuthProvider内で使用する必要があります');
  }
  return context;
};
