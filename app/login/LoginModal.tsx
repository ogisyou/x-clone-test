// app/login/LoginModal.tsx

import React, { useState } from 'react';
import { signInWithEmailAndPassword, AuthError } from 'firebase/auth';
import { getFirebaseServices } from '../firebase';
import GoogleLoginButton from './GoogleLoginButton';
import { User } from '@/app/types/user';
import CloseIcon from '@mui/icons-material/Close';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: User) => void;
}

const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
}) => {
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
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
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
            setError(
              'ログイン中にエラーが発生しました。もう一度お試しください。'
            );
        }
      } else {
        setError('不明なエラーが発生しました。もう一度お試しください。');
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-30 flex justify-center items-center min-h-screen">
      <div className="bg-black p-9 rounded-2xl w-[400px] max-w-[90vw] h-[500px] max-h-[90vh] relative">
        <button
          onClick={onClose}
          className="absolute top-4 left-4 text-gray-400 hover:text-white"
        >
          <CloseIcon />
        </button>
        <h2 className="text-2xl font-bold mb-8 text-white text-center">ログイン</h2>
        <form onSubmit={handleEmailLogin}>
          <input
            type="email"
            placeholder="メールアドレス"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 mb-5 border border-gray-700 rounded text-white bg-black"
          />
          <input
            type="password"
            placeholder="パスワード"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 mb-14 border border-gray-700 rounded text-white bg-black"
          />
          {error && <p className="text-red-500 mb-4">{error}</p>}
          <button
            type="submit"
            className="w-[300px] max-w-[70vw] bg-blue-500 text-white py-3 rounded-full font-bold hover:bg-blue-600 mb-9"
          >
            ログイン
          </button>
        </form>
        <GoogleLoginButton
          onLoginSuccess={onLoginSuccess}
          onLoginError={(errorMessage) => setError(errorMessage)}
        />
      </div>
    </div>
  );
};

export default LoginModal;
