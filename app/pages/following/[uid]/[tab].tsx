import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { db } from '../firebase'; // Firebase 設定ファイルからインポート
import { doc, getDoc, collection, getDocs, updateDoc, arrayRemove } from 'firebase/firestore'; // Firestoreの関数をインポート
import Sidebar from '../components/sidebar/Sidebar';
import Widgets from '../components/widget/Widgets';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import TabMenu from '../components/common/TabMenu';
import { Avatar } from '@mui/material';
import { getAuth } from 'firebase/auth';
import '../index.css';

const Following = () => {
  const { uid, tab } = useParams(); // 現在のタブ状態を取得
  const [users, setUsers] = useState([]); // ユーザーデータの状態を管理する
  const [followers, setFollowers] = useState([]); // フォロワーデータの状態を管理
  const [loading, setLoading] = useState(true); // ローディング状態を管理する
  const [loadingAuth, setLoadingAuth] = useState(true); // 認証状態のローディング
  const [currentUser, setCurrentUser] = useState(null); // 現在のユーザー情報を保持

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setCurrentUser(user);
      }
      setLoadingAuth(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchFollowingUsers = async () => {
      if (!uid) {
        console.error('UIDが存在しません');
        return;
      }

      setLoading(true); // ローディングを開始
      try {
        const userDocRef = doc(db, 'users', uid); // 現在のユーザーのドキュメントを参照
        const userDoc = await getDoc(userDocRef);

        if (!userDoc.exists()) {
          console.error('ユーザーデータが見つかりません');
          return;
        }

        const userData = userDoc.data();
        const followingIds = userData?.following || []; // フォローしているユーザーの ID を取得

        // フォローしているユーザーがいない場合
        if (followingIds.length === 0) {
          setUsers([]); // 空の配列をセット
        } else {
          const validFollowingUsers = []; // 有効なフォローしているユーザー
          const invalidFollowingIds = []; // 無効なフォローしているユーザーID

          for (const id of followingIds) {
            const userDocRef = doc(db, 'users', id);
            const userDoc = await getDoc(userDocRef);

            if (userDoc.exists()) {
              validFollowingUsers.push({ id, ...userDoc.data() });
            } else {
              invalidFollowingIds.push(id);
            }
          }

          setUsers(validFollowingUsers); // 有効なフォロワーの情報を状態に保存

          // 無効なユーザーをフォローリストから削除
          if (invalidFollowingIds.length > 0) {
            await updateDoc(userDocRef, {
              following: arrayRemove(...invalidFollowingIds)
            });
          }
        }

        // フォロワーを取得
        const followersIds = userData?.followers || [];
        if (followersIds.length > 0) {
          // フォロワー情報を再度取得
          const followersSnapshot = await getDocs(collection(db, 'users')); // フォロワー情報を取得するため再度定義
          const followersData = followersSnapshot.docs
            .filter((doc) => followersIds.includes(doc.id))
            .map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }));
          setFollowers(followersData); // フォロワーの情報を状態に保存
        } else {
          setFollowers([]); // フォロワーがいない場合、空の配列を設定
        }
      } catch (error) {
        console.error('Error fetching following/followers users:', error);
      } finally {
        setLoading(false); // ローディングを終了
      }
    };

    fetchFollowingUsers();
  }, [uid]); // uid が変更されたときに再実行

  // ローディング中の場合の表示
  if (loadingAuth) {
    return <p>Loading user information...</p>;
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
          {/* currentUser が存在しない場合は # にフォールバック */}
          <Link to={currentUser ? `/home/${currentUser.uid}` : '#'} className="flex mr-5 rounded-full hover:bg-gray-800">
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
              {tab === 'following' && (
                <div>
                  {users.length === 0 ? (
                    <p>フォロー中のユーザーはいません。</p>
                  ) : (
                    <ul>
                      {users.map((user) => (
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
              {tab === 'followers' && (
                <div>
                  {followers.length === 0 ? (
                    <p>フォロワーはいません。</p>
                  ) : (
                    <ul>
                      {followers.map((user) => (
                        <li
                          key={user.id}
                          className="mb-4 flex items-center space-x-4 border-b-2 border-gray-700"
                        >
                          {user.avatarURL ? (
                            <img
                              src={user.avatarURL}
                              alt={user.displayName}
                              className="w-12 h-12 rounded-full bg-white ml-3"
                            />
                          ) : (
                            <Avatar className="w-12 h-12 ml-3" />
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

export default Following;
