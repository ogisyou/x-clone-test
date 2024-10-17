// app/components/widget/Widgets.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { Search } from '@mui/icons-material';
import { collection, query, getDocs, getFirestore } from 'firebase/firestore';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';

const TwitterTweetEmbed = dynamic(
  () => import('react-twitter-embed').then((mod) => mod.TwitterTweetEmbed),
  { ssr: false }
);

const TwitterTimelineEmbed = dynamic(
  () => import('react-twitter-embed').then((mod) => mod.TwitterTimelineEmbed),
  { ssr: false }
);

const TwitterShareButton = dynamic(
  () => import('react-twitter-embed').then((mod) => mod.TwitterShareButton),
  { ssr: false }
);

interface WidgetsProps {
  className: string;
}

interface User {
  id: string;
  username: string;
  email: string;
}

const Widgets: React.FC<WidgetsProps> = ({ className }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const router = useRouter();

  const firestore = getFirestore();

  const searchUsers = useCallback(async (term: string) => {
    if (!term) {
      setUsers([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const usersRef = collection(firestore, 'users');
    const q = query(usersRef);

    const querySnapshot = await getDocs(q);
    const userList: User[] = [];
    const lowercaseTerm = term.toLowerCase();

    querySnapshot.forEach((doc) => {
      const userData = doc.data() as Omit<User, 'id'>;
      if (userData.username.toLowerCase().startsWith(lowercaseTerm)) {
        userList.push({ id: doc.id, ...userData });
      }
    });

    setUsers(userList);
    setIsSearching(false);
  }, [firestore]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchUsers(searchTerm);
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [searchTerm, searchUsers]);

  const handleUserClick = (userId: string) => {
    setSearchTerm('');
    router.push(`/user/${userId}`);
  };

  return (
    <div className={className}>
      <div className="relative">
        <div className="flex items-center space-x-2 bg-gray-800 p-3 rounded-full mt-2 mb-1">
          <Search className="text-gray-400" />
          <input
            type="text"
            placeholder="キーワード検索"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 outline-none bg-transparent text-white"
          />
        </div>
        
        {searchTerm && (
          <div className="absolute left-0 right-0 bg-gray-800 mt-1 rounded-lg shadow-lg z-10">
            {isSearching ? (
              <div className="p-3 text-white">検索中...</div>
            ) : users.length > 0 ? (
              users.map((user) => (
                <div 
                  key={user.id} 
                  className="p-3 border-b border-gray-700 last:border-none cursor-pointer hover:bg-gray-700"
                  onClick={() => handleUserClick(user.id)}
                >
                  <p className="text-white">{user.username}</p>
                  <p className="text-gray-400 text-sm">{user.email}</p>
                </div>
              ))
            ) : (
              <div className="p-3 text-gray-400">該当するユーザーが見つかりません</div>
            )}
          </div>
        )}
      </div>

      <React.Suspense fallback={<div>Loading tweet...</div>}>
        <TwitterTweetEmbed tweetId={'1841669403131445742'} />
      </React.Suspense>

      <React.Suspense fallback={<div>Loading timeline...</div>}>
        <TwitterTimelineEmbed
          sourceType="profile"
          screenName="GUser202464"
          options={{ height: 400 }}
        />
      </React.Suspense>

      <React.Suspense fallback={<div>Loading share button...</div>}>
        <TwitterShareButton url={'https://twitter.com'} options={{ text: 'Hello World!' }} />
      </React.Suspense>
    </div>
  );
};

export default Widgets;