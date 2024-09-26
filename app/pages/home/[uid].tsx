'use client';

import React, { useEffect, useState } from 'react';
import { getAuth } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { useSearchParams } from 'next/navigation'; // ルーティングを使用
import Sidebar from '../../components/sidebar/Sidebar';
import Timeline from '../../components/timeline/Timeline';
import Widgets from '../../components/widget/Widgets';
import '../../globals.css'; // カスタムCSSを適用
import { db } from '@/app/firebase';

// isGuest の型を boolean として指定
interface HomeProps {
  isGuest: boolean;
}

function Home({ isGuest }: HomeProps) {
  const searchParams = useSearchParams();
  const uid = searchParams.get('uid'); // URLクエリパラメータから 'uid' を取得
  const [username, setUsername] = useState<string>(''); // username は string
  const [loading, setLoading] = useState<boolean>(true); // loading は boolean

  useEffect(() => {
    const fetchUserData = async () => {
      if (uid) {
        const userDocRef = doc(db, 'users', uid as string);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          setUsername(userDoc.data()?.username || 'Guest_User');
        } else {
          setUsername('Guest_User');
        }
        setLoading(false); // データの取得が完了したのでローディングを終了
      }
    };

    fetchUserData();
  }, [uid]);

  if (loading) return <p>Loading...</p>; // ローディング中は表示する

  return (
    <div className="flex h-screen max-w-[1300px] mx-auto bg-black text-white">
      <Sidebar
        username={username}
        uid={uid as string} // uid を string にキャスト
        className="sticky top-0 h-screen"
      />
      <div className="border-x border-gray-700 w-full sm:max-w-[600px] overflow-auto h-screen custom-scrollbar">
        <Timeline uid={uid as string} origin="home" />
      </div>
      <Widgets uid={uid as string} className="sticky top-0 h-screen" />
    </div>
  );
}

export default Home;
