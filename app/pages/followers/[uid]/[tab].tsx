import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';

import { doc, getDoc, updateDoc, arrayRemove } from 'firebase/firestore'; // Firestoreの関数をインポート


import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Avatar } from '@mui/material';
import TabMenu from '../components/common/TabMenu';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import '../index.css';
import { db } from '@/app/firebase';
import Sidebar from '@/app/components/sidebar/Sidebar';
import Widgets from '@/app/components/widget/Widgets';

const Followers = () => {
  const { uid, tab } = useParams(); // 現在のタブ状態を取得
  const [followers, setFollowers] = useState([]); // フォロワーのデータを状態で管理
  const [loading, setLoading] = useState(true); // ローディング状態を管理
  const [currentUser, setCurrentUser] = useState(null); // 現在のユーザーを状態で管理
  const auth = getAuth();

  // 認証状態の確認
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
      } else {
        setCurrentUser(null);
      }
    });
    return () => unsubscribe();
  }, [auth]);

  useEffect(() => {
    const fetchFollowers = async () => {
      setLoading(true); // ローディングを開始
      try {
        if (!currentUser) {
          console.error('ユーザーがログインしていません');
          return;
        }

        const userDocRef = doc(db, 'users', uid); // 現在のユーザーのドキュメントを参照
        const userDoc = await getDoc(userDocRef);
        const userData = userDoc.data();

        if (!userData) {
          console.error('ユーザーデータが見つかりません');
          return;
        }

        const followersIds = userData.followers || []; // フォロワーの ID を取得

        if (followersIds.length > 0) {
          const validFollowers = []; // 有効なフォロワーのリスト
          const invalidFollowers = []; // 無効なフォロワーのリスト

          for (const id of followersIds) {
            const userDocRef = doc(db, 'users', id);
            const userDoc = await getDoc(userDocRef);

            if (userDoc.exists()) {
              validFollowers.push({ id, ...userDoc.data() });
            } else {
              invalidFollowers.push(id);
            }
          }

          setFollowers(validFollowers); // 有効なフォロワーの情報を状態に保存

          // 無効なフォロワーを削除
          if (invalidFollowers.length > 0) {
            await updateDoc(userDocRef, {
              followers: arrayRemove(...invalidFollowers)
            });
          }
        } else {
          setFollowers([]); // フォロワーがいない場合、空の配列を設定
        }
      } catch (error) {
        console.error('Error fetching followers:', error);
      } finally {
        setLoading(false); // ローディングを終了
      }
    };

    if (uid) {
      fetchFollowers();
    }
  }, [uid, currentUser]); // uid または currentUser が変更されたときに再実行

  // ログインしていない場合の処理
  if (!currentUser) {
    return <p>Loading user data...</p>;
  }

  return (
    <div className="flex h-screen max-w-[1300px] mx-auto bg-black text-white">
      {/* Sidebar を固定 */}
      <Sidebar
        username={localStorage.getItem('username')}
        uid={uid}
        className="sticky top-0 h-screen"
      />

      <div className="flex-[1] text-base font-bold border-b-0 border-gray-700 xl:flex-[0.45] h-full">
        <div className="flex">
          <Link to={`/home/${currentUser.uid}`} className="flex mr-5 rounded-full hover:bg-gray-800">
            <ArrowBackIcon className="text-5xl" />
          </Link>
          <div className="text-3xl text-blue-400">
            {localStorage.getItem('username')}
            <p className="text-xs text-gray-400">
              @{localStorage.getItem('username')}
            </p>
          </div>
        </div>

        {/* タブメニュー */}
        <TabMenu
          tabs={[
            { name: 'recommended', label: 'おすすめのユーザー' },
            { name: 'following', label: 'フォロー中' },
            { name: 'followers', label: 'フォロワー' },
          ]}
          activeTab={tab} // 現在のタブをアクティブにする
        />

        {/* タブに応じたコンテンツの表示 */}
        <div>
          {loading ? (
            <p className="mt-5">Loading...</p>
          ) : (
            <div>
              {tab === 'followers' && (
                <div>
                  {followers.length === 0 ? (
                    <p>フォロワーはいません。</p>
                  ) : (
                    <ul>
                      {followers.map((user) => (
                        <li
                          key={user.id}
                          className="py-2 flex items-center space-x-4 border-b-2 border-gray-700"
                        >
                          {user.avatarURL ? (
                            <Link to={`/user/${user.id}`}>
                              <img
                                src={user.avatarURL}
                                alt={user.displayName}
                                className="w-12 h-12 rounded-full bg-white ml-3"
                              />
                            </Link>
                          ) : (
                            <Link to={`/user/${user.id}`}>
                              <Avatar className="w-12 h-12 ml-3" />
                            </Link>
                          )}
                          <div className="w-full ">
                            <div className="flex justify-between items-center ">
                              <div>
                                <p className="text-lg font-bold">
                                  {user.displayName}
                                </p>
                                <p className="text-sm text-gray-400">
                                  @{user.username}
                                </p>
                              </div>
                            </div>
                            <p className="text-lg font-bold">{user.bio}</p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
              {tab === 'following' && <p>フォロー中のユーザー</p>}
              {tab === 'recommended' && <p>おすすめのユーザー</p>}
            </div>
          )}
        </div>
      </div>

      {/* Widgets を固定 */}
      <Widgets uid={uid} className="sticky top-0 h-screen" />
    </div>
  );
};

export default Followers;
