// app/login/LoginModal.tsx

import React, { useState } from 'react';
import { signInWithEmailAndPassword, AuthError } from 'firebase/auth';
import { getFirebaseServices } from '../firebase';
import GoogleLoginButton from './GoogleLoginButton';
import { User } from '@/app/types/user';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: User) => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError('メールアドレスとパスワードを入力してください');
      return;
    }

    try {
      const { auth } = getFirebaseServices();
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      onLoginSuccess(userCredential.user as User);
      onClose();
    } catch (error) {
      console.error('ログインエラー:', error);
      if (error instanceof Error) {
        const firebaseError = error as AuthError;
        switch (firebaseError.code) {
          case 'auth/user-not-found':
          case 'auth/wrong-password':
            setError('メールアドレスまたはパスワードが正しくありません。');
            break;
          case 'auth/invalid-email':
            setError('無効なメールアドレスです。');
            break;
          default:
            setError('ログイン中にエラーが発生しました。もう一度お試しください。');
        }
      } else {
        setError('不明なエラーが発生しました。もう一度お試しください。');
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-white p-6 rounded-lg w-96">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">ログイン</h2>
        <form onSubmit={handleEmailLogin}>
          <input
            type="email"
            placeholder="メールアドレス"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 mb-4 border rounded text-gray-800"
          />
          <input
            type="password"
            placeholder="パスワード"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 mb-4 border rounded text-gray-800"
          />
          {error && <p className="text-red-500 mb-4">{error}</p>}
          <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 mb-4">
            ログイン
          </button>
        </form>
        <GoogleLoginButton
          onLoginSuccess={onLoginSuccess}
          onLoginError={(errorMessage) => setError(errorMessage)}
        />
        <button onClick={onClose} className="w-full mt-4 text-gray-600 hover:text-gray-800">
          閉じる
        </button>
      </div>
    </div>
  );
};

export default LoginModal;