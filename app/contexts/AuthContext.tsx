import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { getAuth, onAuthStateChanged, signInAnonymously, User } from 'firebase/auth';
import { useRouter } from 'next/navigation';

interface AuthContextProps {
  isAuth: boolean;
  setIsAuth: (value: boolean) => void;
  user: User | null;
  setUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuth, setIsAuth] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const auth = getAuth();
  const router = useRouter();

  useEffect(() => {
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
    });

    return () => unsubscribe();
  }, [auth, router]);

  const signInAsGuest = async () => {
    try {
      const guestUser = await signInAnonymously(auth);
      setIsAuth(true);
      setUser(guestUser.user);
      console.log('ゲストとしてサインイン:', guestUser.user.uid);
    } catch (error) {
      console.error('ゲストサインイン中にエラーが発生しました:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ isAuth, setIsAuth, user, setUser }}>
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