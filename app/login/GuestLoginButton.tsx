// app/login/GuestLoginButton.tsx

import React, { useState } from 'react';
import { signInAnonymously } from 'firebase/auth';
import { doc, setDoc, collection, query, orderBy, getDocs } from 'firebase/firestore';
import { getFirebaseServices } from '../firebase';
import { useRouter } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';
import { User } from '@/app/types/user';

interface GuestLoginButtonProps {
  onLoginSuccess: (user: User) => void;
  onLoginError: (error: string) => void;
}

const getExpiryDate = () => {
  const expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() + 1);
  return expiryDate;
};

const GuestLoginButton: React.FC<GuestLoginButtonProps> = ({ onLoginSuccess, onLoginError }) => {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { setIsAuth, setUser } = useAuth();

  const handleGuestLogin = async () => {
    setIsLoading(true);

    try {
      const { auth, db } = getFirebaseServices();

      const result = await signInAnonymously(auth);
      const guestUser = result.user as User;
      const guestPrefix = guestUser.uid.slice(0, 4);
      const guestUsername = `Guest_${guestPrefix}`;

      console.log('ゲストログイン成功: setIsAuthに渡される値:', false);
      console.log('ゲストログイン成功: setUserに渡される値:', guestUser);

      localStorage.setItem('isAuth', 'false');
      localStorage.setItem('user', JSON.stringify(guestUser));
      localStorage.setItem('username', guestUsername);

      setIsAuth(false);
      setUser(guestUser);

      const userDocRef = doc(db, 'users', guestUser.uid);
      await setDoc(
        userDocRef,
        {
          username: guestUsername,
          displayName: guestUsername,
          bio: '',
          birthplace: '',
          birthDate: '',
          isAnonymous: true,
          createdAt: new Date(),
          expiryDate: getExpiryDate(),
        },
        { merge: true }
      );

      const idToken = await guestUser.getIdToken(true);
      console.log("認証トークン:", idToken);

      const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/deleteUser`;
      console.log('API URL:', apiUrl);

      const usersCollection = collection(db, 'users');
      const guestQuery = query(usersCollection, orderBy('createdAt'));
      const guestSnapshot = await getDocs(guestQuery);
      const guestUsers = guestSnapshot.docs.filter((doc) => doc.data().isAnonymous);

      if (guestUsers.length > 1) {
        const oldestUser = guestUsers[0];
        const oldestUid = oldestUser.id;

        const response = await fetch(apiUrl, {
          method: 'POST',
          mode: 'cors',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${idToken}`
          },
          body: JSON.stringify({ uid: oldestUid }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('APIレスポンス:', response.status, errorText);
          throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
        }

        const responseData = await response.json();
        console.log('サーバーレスポンス:', responseData);
      } else {
        console.log('削除対象の古いゲストユーザーが見つかりませんでした');
      }

      onLoginSuccess(guestUser);
      router.push(`/home/${guestUser.uid}`);
      console.log(`ホームページに遷移しました: /home/${guestUser.uid}`);
    } catch (error) {
      console.error('ゲストログインエラー:', error);
      onLoginError(error instanceof Error ? error.message : '不明なエラーが発生しました');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      className="w-[300px] max-w-[80vw] bg-gray-500 text-white font-bold py-3 rounded-full hover:bg-gray-400 transition"
      onClick={handleGuestLogin}
      disabled={isLoading}
    >
      {isLoading ? 'ログイン中...' : 'ゲストログイン'}
    </button>
  );
};

export default GuestLoginButton;