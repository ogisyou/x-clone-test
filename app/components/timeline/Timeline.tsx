import React, { useState, useEffect } from 'react';
import TweetBox from './TweetBox';
import Post from './Post';
import { db, auth } from '../../firebase'; 
import { collection, onSnapshot, orderBy, query, where, QuerySnapshot, QueryDocumentSnapshot, FirestoreError, DocumentData } from 'firebase/firestore';
import { getAuth, signInAnonymously } from 'firebase/auth'; 
import FlipMove from 'react-flip-move';

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

const Timeline: React.FC<TimelineProps> = ({ origin, uid }) => {
  const [posts, setPosts] = useState<PostData[]>([]);
  const [currentUser, setCurrentUser] = useState(auth.currentUser); 

  const signInAsGuest = async () => {
    const authInstance = getAuth();
    
    // 既存のユーザーがいる場合はゲストサインインをスキップ
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
    // 現在のユーザーが存在しない場合のみゲストサインインを試みる
    if (!currentUser) {
      signInAsGuest();
    } else {
      console.log('既存のユーザーでログイン:', currentUser.uid);
    }
  }, [currentUser]); // currentUser を依存配列に追加

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
    if (!currentUser) return; // currentUser が存在しない場合は何もしない

    console.log('Timelineに渡されたorigin:', origin);
    console.log('現在のログインユーザーUID:', currentUser.uid);
    console.log('URLパラメータUID (profileUid):', uid);

    const postData = collection(db, 'posts');
    let q;

    if (origin === 'home') {
      q = query(
        postData,
        where('profileUid', '==', currentUser.uid), 
        orderBy('timestamp', 'desc') 
      );
    } else if (origin === 'user') {
      q = query(
        postData,
        where('uid', '==', uid), 
        where('profileUid', '==', uid), 
        where('origin', '==', 'user'), 
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
  }, [origin, uid, currentUser]); // currentUser を依存配列に追加

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
