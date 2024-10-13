// app/login/SignUpModal.tsx

import React, { useState } from 'react';
import { createUserWithEmailAndPassword, sendEmailVerification, AuthError } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { getFirebaseServices } from '../firebase';

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
        email,
        createdAt: new Date(),
        emailVerified: false,
      });

      setMessage('アカウントが作成されました。確認メールを送信しましたので、メールを確認してアカウントを有効化してください。');

      // モーダルを閉じるのではなく、メッセージを表示します
      // onClose();
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-white p-6 rounded-lg w-96">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">アカウント作成</h2>
        {message ? (
          <div>
            <p className="text-green-500 mb-4">{message}</p>
            <button onClick={onClose} className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600">
              閉じる
            </button>
          </div>
        ) : (
          <form onSubmit={handleSignUp}>
            <input
              type="text"
              placeholder="ユーザー名"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-2 mb-4 border rounded text-gray-800"
            />
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
            <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600">
              登録
            </button>
          </form>
        )}
        {!message && (
          <button onClick={onClose} className="mt-4 text-gray-600 hover:text-gray-800">
            閉じる
          </button>
        )}
      </div>
    </div>
  );
};

export default SignUpModal;