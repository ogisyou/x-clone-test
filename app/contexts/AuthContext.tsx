import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { getFirebaseServices } from '../firebase'; 
import { onAuthStateChanged, User } from 'firebase/auth';
import { useRouter } from 'next/navigation';

interface AuthContextProps {
  isAuth: boolean;
  setIsAuth: (value: boolean) => void;
  user: User | null;
  setUser: (user: User | null) => void;
  loading: boolean; // loading 状態を追加
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuth, setIsAuth] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true); // loading 初期値を true に
  const router = useRouter();
  
  useEffect(() => {
    const { auth } = getFirebaseServices(); 
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setIsAuth(true);
        setUser(currentUser);
        console.log('ユーザーがログインしました:', currentUser.uid);
      } else {
        setIsAuth(false);
        setUser(null);
        console.log('ユーザーがログアウトしました');
        router.push('/login');
      }
      setLoading(false); // 認証状態のチェックが完了したら loading を false に
    });

    return () => unsubscribe();
  }, [router]);

  return (
    <AuthContext.Provider value={{ isAuth, setIsAuth, user, setUser, loading }}>
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
