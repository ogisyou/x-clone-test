import React, { useState } from 'react';
import { signInWithPopup, signInAnonymously } from 'firebase/auth';
import { auth, provider } from '../firebase';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { doc, setDoc, collection, query, orderBy, getDocs } from 'firebase/firestore';
import XIcon from '@mui/icons-material/X';

const getExpiryDate = () => {
  const expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() + 1); // 1日後を有効期限とする
  return expiryDate;
};

const Login = ({ setIsAuth }) => {
  const navigate = useNavigate();
  const [isButtonDisabled, setIsButtonDisabled] = useState(false); // ボタンの状態管理

  const loginInWithGoogle = () => {
    setIsButtonDisabled(true); // ボタンを無効にする
    signInWithPopup(auth, provider)
      .then(async (result) => {
        const user = result.user;
        const username = user.displayName;
        const uid = user.uid;

        localStorage.setItem('isAuth', 'true');
        localStorage.setItem('username', username);
        localStorage.setItem('uid', uid);
        setIsAuth(true);

        const userDocRef = doc(db, 'users', uid);
        await setDoc(userDocRef, {
          username: user.displayName || '',
          displayName: user.displayName || '',
          bio: '',
          birthplace: '',
          birthDate: '',
        });

        console.log(`Googleログイン成功: ユーザー名: ${username}, UID: ${uid}`);
        navigate(`/home/${uid}`);
      })
      .catch((error) => {
        console.error('Googleログインエラー:', error.message);
        setIsButtonDisabled(false); // エラー発生時にボタンを再度有効にする
      });
  };

  const handleGuestLogin = async () => {
    setIsButtonDisabled(true); // ボタンを無効にする
    try {
      const usersCollection = collection(db, 'users');
      const guestQuery = query(usersCollection, orderBy('createdAt'));
      const guestSnapshot = await getDocs(guestQuery);

      const guestUsers = guestSnapshot.docs.filter((doc) => doc.data().isAnonymous);

      if (guestUsers.length >= 1) {
        const oldestUser = guestUsers[0];
        const oldestUid = oldestUser.id;

        const apiUrl = process.env.REACT_APP_API_URL || 'https://twitter-clone-test2.web.app/delete-user';
        console.log('API URL:', apiUrl);

        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ uid: oldestUid }),
        });

        if (!response.ok) {
          const errorMessage = await response.text();
          throw new Error(`HTTPエラー! ステータス: ${response.status}, メッセージ: ${errorMessage}`);
        }

        const data = await response.text();
        console.log(`サーバーからのレスポンス: ${data}`);
        console.log(`古いゲストユーザーが削除されました: UID = ${oldestUid}`);
      }

      const result = await signInAnonymously(auth);
      const guestUid = result.user.uid;
      const guestPrefix = guestUid.slice(0, 4);
      const guestUsername = `Guest_${guestPrefix}`;

      localStorage.setItem('isAuth', 'false');
      localStorage.setItem('uid', guestUid);
      localStorage.setItem('username', guestUsername);

      const userDocRef = doc(db, 'users', guestUid);
      await setDoc(userDocRef, {
        username: guestUsername,
        displayName: guestUsername,
        bio: '',
        birthplace: '',
        birthDate: '',
        isAnonymous: true,
        createdAt: new Date(),
        expiryDate: getExpiryDate(),
      });

      navigate(`/home/${guestUid}`);
      console.log(`ホームページに遷移しました: /home/${guestUid}`);
    } catch (error) {
      console.error('ゲストログインエラー:', error.message);
      setIsButtonDisabled(false); // エラー発生時にボタンを再度有効にする
    }
  };

  return (
    <div className="text-gray-300 p-3 max-w-[500px] mx-auto lg:h-screen lg:max-w-[1500px] lg:flex lg:justify-center lg:items-center">
      <div className="0 mb-20 w-full lg:mb-20">
        <div className="text-start lg:w-full lg:h-full xl:text-center">
          <XIcon className='w-12 h-12 lg:w-full lg:h-full lg:max-w-[350px] lg:p-8' />
        </div>
      </div>

      <div className="text-center lg:min-w-[640px] lg:p-5 flex-[0.8] lg:mr-20 lg:mb-64 xl:w-full">
        <div className="mb-16">
          <h1 className="text-5xl sm:text-6xl font-bold">すべての話題が、ここに</h1>
          <h2 className="text-2xl sm:text-3xl font-bold mt-14">今すぐ参加しましょう。</h2>
        </div>

        <div className="space-y-6">
          <div>
            <button className="w-[300px] bg-blue-500 text-white font-bold py-3 rounded-full hover:bg-blue-400 transition">
              アカウントを作成
            </button>
          </div>
          <div>
            <button
              className="w-[300px] bg-black text-blue-400 border border-gray-700 font-bold py-3 rounded-full hover:bg-gray-800 transition"
              onClick={loginInWithGoogle}
              disabled={isButtonDisabled} // ボタンの無効化
            >
              Googleでログイン
            </button>
          </div>
          <div>
            <button
              className="w-[300px] bg-gray-500 text-white font-bold py-3 rounded-full hover:bg-gray-400 transition"
              onClick={handleGuestLogin}
              disabled={isButtonDisabled} // ボタンの無効化
            >
              ログインせずに続ける
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
