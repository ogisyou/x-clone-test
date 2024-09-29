import React, { useState, useEffect } from 'react';
import TweetBox from './TweetBox';
import Post from './Post';
import { db, auth } from '../../firebase'; 
import { collection, onSnapshot, orderBy, query, where, QuerySnapshot, QueryDocumentSnapshot, FirestoreError, DocumentData } from 'firebase/firestore';
import { getAuth, signInAnonymously } from 'firebase/auth'; 
import FlipMove from 'react-flip-move';
import { useParams } from 'next/navigation';

interface PostData {
  id: string;
  displayName: string;
  username: string;
  verified: boolean;
  text: string;
  avatar: string;
  image: string;
  uid: string;
  timestamp: any; 
}

interface TimelineProps {
  origin: string;
  uid: string;
}



const Timeline: React.FC<TimelineProps> = ({ origin,uid}) => {
  const [posts, setPosts] = useState<PostData[]>([]);
  const [currentUser, setCurrentUser] = useState(auth.currentUser);
  const { uid: profileUid } = useParams(); 
  const signInAsGuest = async () => {
    const authInstance = getAuth();
    
    if (authInstance.currentUser) {
      console.log('既存のユーザーが存在します:', authInstance.currentUser.uid);
      setCurrentUser(authInstance.currentUser);
      return;
    }

    try {
      const guestUser = await signInAnonymously(authInstance);
      setCurrentUser(guestUser.user);
      console.log('ゲストとしてサインイン:', guestUser.user);
    } catch (error) {
      console.error('ゲストサインイン中にエラーが発生しました:', error);
    }
  };

  useEffect(() => {
    if (auth.currentUser && !currentUser) {
      setCurrentUser(auth.currentUser);
      return;
    }

    if (!auth.currentUser) {
      signInAsGuest();
    } else {
      console.log('既存のユーザーでログイン:', auth.currentUser.uid);
    }
  }, []); // currentUser を依存配列から削除

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'posts'), (snapshot) => {
      const allPosts = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data() as Omit<PostData, 'id'>
      }));
      setPosts(allPosts);
    });

    return () => {
      console.log('リスナー解除');
      unsubscribe();
    };
  }, []); // 初回レンダリング時に投稿データを取得

  useEffect(() => {
    if (!auth.currentUser) return; // currentUser が存在しない場合は何もしない
  
    console.log('Timelineに渡されたorigin:', origin);
    console.log('現在のログインユーザーUID:', auth.currentUser.uid);
    console.log('URLパラメータUID (profileUid):', profileUid);
    console.log('UID (uid):', uid);
  
    const postData = collection(db, 'posts');
    let q;
  
    if (origin === 'home') {
      q = query(
        postData,
        where('profileUid', '==', auth.currentUser.uid),
        orderBy('timestamp', 'desc')
      );
    } else if (origin === 'user') {
      q = query(
        postData,
        where('profileUid', '==', profileUid), // profileUidが profileUid または uid に一致する投稿を取得
        where('uid', 'in', [profileUid, auth.currentUser.uid]), // profileUidが profileUid または uid に一致する投稿を取得
        orderBy('timestamp', 'desc')
      );
    }
  
    if (q) {
      const unsubscribe = onSnapshot(q, (querySnapshot: QuerySnapshot<DocumentData>) => {
        const allPosts = querySnapshot.docs.map((doc: QueryDocumentSnapshot<DocumentData>) => ({
          id: doc.id,
          ...doc.data() as Omit<PostData, 'id'>
        }));
        setPosts(allPosts);
      }, (error: FirestoreError) => {
        console.error('Firestore リスナーエラー:', error);
      });
  
      return () => {
        console.log('リスナー解除');
        unsubscribe();
      };
    }
  }, [origin, profileUid]); // uid を依存配列に追加
   // currentUser を依存配列から削除

  return (
    <div className="flex-[1] border-b-0 border-gray-700 xl:flex-[0.45] h-full">
      <TweetBox origin={origin} />
      <FlipMove>
        {posts.length > 0 ? (
          posts.map((post) => {
            const timestamp = post.timestamp?.toDate();
            const formattedDate = timestamp ? timestamp.toLocaleString() : '';

            return (
              <Post
                key={post.id}
                id={post.id}
                displayName={post.displayName}
                username={post.username}
                verified={post.verified}
                text={post.text}
                avatar={post.avatar}
                image={post.image}
                postUid={post.uid}
                timestamp={formattedDate} 
              />
            );
          })
        ) : (
          <p className="text-gray-500">投稿がありません</p>
        )}
      </FlipMove>
    </div>
  );
};

export default Timeline;
