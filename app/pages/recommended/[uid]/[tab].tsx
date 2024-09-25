import { db } from '../firebase'; 
import { collection, getDocs, getDoc, doc } from 'firebase/firestore'; 
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getAuth, onAuthStateChanged } from 'firebase/auth'; 
import Sidebar from '../components/sidebar/Sidebar';
import Widgets from '../components/widget/Widgets';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import TabMenu from '../components/common/TabMenu';
import '../index.css';
import FollowButton from '../components/common/FollowButton';
import { Avatar } from '@mui/material';

const RecommendedUsers = () => {
  const { uid, tab } = useParams();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [following, setFollowing] = useState(new Set());
  const [currentUser, setCurrentUser] = useState(null);
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
    const fetchUsers = async () => {
      setLoading(true);
      try {
        if (!currentUser) {
          console.error('ユーザーがログインしていません');
          return;
        }

        const currentUserDocRef = doc(db, 'users', currentUser.uid);
        const currentUserDoc = await getDoc(currentUserDocRef);
        const currentUserData = currentUserDoc.data();
        const followingSet = new Set(currentUserData.following || []);
        setFollowing(followingSet);

        const usersCollection = collection(db, 'users');
        const userSnapshot = await getDocs(usersCollection);

        const userList = userSnapshot.docs
          .map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }))
          .filter((user) => user.id !== currentUser.uid);  // 自分自身を除外

        setUsers(userList);
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setLoading(false);
      }
    };

    if (currentUser) {
      fetchUsers();
    }
  }, [currentUser]);

  // ログインしていない場合の処理
  if (!currentUser) {
    return <p>Loading user data...</p>;
  }

  return (
    <div className="flex h-screen max-w-[1300px] mx-auto bg-black text-white">
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

        <TabMenu 
          tabs={[
            { name: 'recommended', label: 'おすすめのユーザー' },
            { name: 'following', label: 'フォロー中' },
            { name: 'followers', label: 'フォロワー' },
          ]}
          activeTab={tab}
        />

        <div>
          {loading ? (
            <p className='mt-5'>Loading...</p>
          ) : (
            <ul>
              {users.map((user) => (
                <li key={user.id} className="py-2 flex items-center space-x-4 border-b-2 border-gray-700">
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
                  <div className='w-full'>
                    <div className='flex justify-between items-center'>
                      <div>
                        <p className="text-lg font-bold">{user.displayName}</p>
                        <p className="text-sm text-gray-400">
                          @{user.username}
                        </p>
                      </div>
                      <FollowButton
                        userId={user.id}
                        following={following}
                        onFollowChange={(userId, isFollowing) => {
                          const updatedFollowing = new Set(following);
                          if (isFollowing) {
                            updatedFollowing.add(userId);
                          } else {
                            updatedFollowing.delete(userId);
                          }
                          setFollowing(updatedFollowing);
                        }}
                      />
                    </div>

                    <p className="text-lg font-bold">{user.bio}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <Widgets uid={uid} className="sticky top-0 h-screen" />
    </div>
  );
};

export default RecommendedUsers;
