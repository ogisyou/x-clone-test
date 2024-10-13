// app/login/GoogleLoginButton.tsx

import React, { useState } from 'react';
import { signInWithPopup, GoogleAuthProvider, AuthError } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { getFirebaseServices } from '../firebase';
import { useRouter } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';
import { User } from '@/app/types/user';

interface GoogleLoginButtonProps {
  onLoginSuccess: (user: User) => void;
  onLoginError: (error: string) => void;
}

const GoogleLoginButton: React.FC<GoogleLoginButtonProps> = ({ onLoginSuccess, onLoginError }) => {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { setIsAuth, setUser } = useAuth();

  const loginInWithGoogle = async () => {
    setIsLoading(true);

    try {
      const { auth, db } = getFirebaseServices();
      const provider = new GoogleAuthProvider();

      const result = await signInWithPopup(auth, provider);
      const user = result.user as User;
      const username = user.displayName || 'Guest';

      console.log('Googleログイン成功: ユーザー情報', {
        username,
        uid: user.uid,
      });

      localStorage.setItem('isAuth', 'true');
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('username', username);

      setIsAuth(true);
      setUser(user);

      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);
      let userData = {
        username: user.displayName || '',
        displayName: user.displayName || '',
        bio: '',
        birthplace: '',
        birthDate: '',
      };

      if (userDoc.exists()) {
        const existingData = userDoc.data();
        userData = {
          ...userData,
          ...existingData,
        };
      }

      await setDoc(userDocRef, userData, { merge: true });

      console.log('Firestore document created for user:', user.uid);

      onLoginSuccess(user);
      router.push(`/home/${user.uid}`);
    } catch (error) {
      console.error('Googleログインエラー:', error);
      if (error instanceof Error) {
        const firebaseError = error as AuthError;
        if (firebaseError.code === 'auth/popup-blocked') {
          onLoginError('ポップアップがブロックされました。ブラウザの設定を確認し、このサイトのポップアップを許可してください。');
        } else {
          onLoginError(`Googleログインエラー: ${firebaseError.message}`);
        }
      } else {
        onLoginError('不明なエラーが発生しました。');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      className="w-[300px] max-w-[70vw] bg-black text-blue-400 border border-gray-700 font-bold py-3 rounded-full hover:bg-gray-800 transition"
      onClick={loginInWithGoogle}
      disabled={isLoading}
    >
      {isLoading ? 'ログイン中...' : 'Googleでログイン'}
    </button>
  );
};

export default GoogleLoginButton;