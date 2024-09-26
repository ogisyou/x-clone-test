'use client';

import React, { useEffect, useState } from 'react';
import { getAuth } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import Sidebar from '../../components/sidebar/Sidebar';
// import Timeline from '../../components/timeline/Timeline';
// import Widgets from '../../components/widget/Widgets';
import '../../globals.css'; // カスタムCSSを適用
import { db } from '@/app/firebase';

// isGuest の型を boolean として指定
interface HomeProps {
  isGuest: boolean;
}

function Home({ isGuest }: HomeProps) {
  const [uid, setUid] = useState<string | null>(null); // uid は string または null
  const [username, setUsername] = useState<string>(''); // username は string
  const [loading, setLoading] = useState<boolean>(true); // loading は boolean

  useEffect(() => {
    const fetchUserData = async (currentUser: any) => {
      // currentUser の型を any または適切な型にする
      const storedUid = localStorage.getItem('uid');
      if (storedUid) {
        setUid(storedUid); // ローカルストレージからUIDを取得
        const userDocRef = doc(db, 'users', storedUid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          setUsername(userDoc.data().username || 'Guest_User');
        } else {
          setUsername('Guest_User');
        }
      }

      setLoading(false); // データの取得が完了したのでローディングを終了
    };

    const auth = getAuth();
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      await fetchUserData(currentUser);
    });

    return () => unsubscribe();
  }, [isGuest]);

  if (loading) return <p>Loading...</p>; // ローディング中は表示する

  return (
    <div className="flex h-screen max-w-[1300px] mx-auto bg-black text-white">

      <Sidebar
        // username={username}
        // uid={uid}
        // className="sticky top-0 h-screen"
      />
      {/* <div className="border-x border-gray-700 w-full sm:max-w-[600px] overflow-auto h-screen custom-scrollbar">
        <Timeline uid={uid} origin="home" />
      </div>
      <Widgets uid={uid} className="sticky top-0 h-screen" /> */}
    </div>
  );
}

export default Home;
