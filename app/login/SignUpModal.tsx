// app/login/SignUpModal.tsx

import React, { useState } from 'react';
import { createUserWithEmailAndPassword, sendEmailVerification, AuthError } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { getFirebaseServices } from '../firebase';
import CloseIcon from '@mui/icons-material/Close';

interface SignUpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SignUpModal: React.FC<SignUpModalProps> = ({ isOpen, onClose }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (!username || !email || !password) {
      setError('すべての欄を入力してください');
      return;
    }

    try {
      const { auth, db } = getFirebaseServices();

      // Firebaseで新しいユーザーを作成
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 確認メールを送信
      await sendEmailVerification(user);

      // Firestoreにユーザー情報を保存
      await setDoc(doc(db, 'users', user.uid), {
        username,
        displayName: username,
        email,
        createdAt: new Date(),
        emailVerified: false,
      });

      setMessage('アカウントが作成されました。確認メールを送信しましたので、メールを確認してアカウントを有効化してください。');

    } catch (error) {
      console.error('サインアップエラー:', error);
      if (error instanceof Error) {
        const firebaseError = error as AuthError;
        switch (firebaseError.code) {
          case 'auth/email-already-in-use':
            setError('このメールアドレスは既に使用されています。');
            break;
          case 'auth/invalid-email':
            setError('無効なメールアドレスです。');
            break;
          case 'auth/weak-password':
            setError('パスワードが弱すぎます。より強力なパスワードを設定してください。');
            break;
          default:
            setError('アカウントの作成中にエラーが発生しました。もう一度お試しください。');
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
        <h2 className="text-2xl font-bold mb-8 text-white text-center">アカウント作成</h2>
        {message ? (
          <div>
            <p className="text-white mb-9">{message}</p>
            <button onClick={onClose} className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600">
              閉じる
            </button>
          </div>
        ) : (
          <form onSubmit={handleSignUp} className="flex flex-col items-center">
            <input
              type="text"
              placeholder="ユーザー名"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-2 mb-5 border border-gray-700 rounded text-white bg-black"
            />
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
              className="w-full p-2 mb-5 border border-gray-700 rounded text-white bg-black"
            />
            {error && <p className="text-red-500 mb-4">{error}</p>}
            <button type="submit" className="w-[300px]  max-w-[70vw] font-bold bg-blue-500 text-white py-3 rounded-full hover:bg-blue-600 mt-8">
              登録
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default SignUpModal;