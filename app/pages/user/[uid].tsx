import React, { useEffect, useState } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { db } from '../firebase'; // Firebase 設定ファイルからインポート
import { doc, getDoc } from 'firebase/firestore';
import Sidebar from "../components/sidebar/Sidebar";
import Timeline from "../components/timeline/Timeline";
import Widgets from "../components/widget/Widgets";
import "../index.css"; // カスタムCSSを適用

function UserProfile() {
  
  
  const [currentUsername, setCurrentUsername] = useState('');
  const [currentUid, setCurrentUid] = useState(''); // 現在のユーザーの UID を保存するステート

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // 現在のユーザーの UID を設定
        setCurrentUid(user.uid);
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          setCurrentUsername(userDoc.data().username || '');
        }
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!currentUid) {

        return;
      }
      const userDocRef = doc(db, 'users', currentUid);
      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists()) {

      }
    };
    fetchProfile();
  }, [currentUid]);



  return (
    <div className="flex h-screen max-w-[1300px] mx-auto bg-black text-white">
      <Sidebar username={currentUsername} uid={currentUid} className="sticky top-0 h-screen" />
      <Timeline uid={currentUid}  origin="user" /> 
      <Widgets uid={currentUid} className="sticky top-0 h-screen" />
    </div>
  );
}

export default UserProfile;
