import React, { useState, useEffect } from 'react';
import TweetBox from './TweetBox';
import Post from './Post';
import { db, auth } from '../../firebase';
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  where,
  QuerySnapshot,
  QueryDocumentSnapshot,
  FirestoreError,
  DocumentData,
  Timestamp,
  Query,
  Firestore,
  getDocs,
} from 'firebase/firestore';
import { User } from 'firebase/auth';
import FlipMove from 'react-flip-move';
import { useParams } from 'next/navigation';

interface ReplyData {
  id: string;
  text: string;
  displayName: string;
  username: string;
  timestamp: string;
  postId: string;
}

interface PostData {
  id: string;
  displayName: string;
  username: string;
  verified: boolean;
  text: string;
  avatar: string;
  image: string;
  uid: string;
  timestamp: Timestamp;
  likeCount: number;
  replies: ReplyData[];
}

interface TimelineProps {
  origin: string;
  uid: string;
}

const Timeline: React.FC<TimelineProps> = ({ origin, uid }) => {
  const [posts, setPosts] = useState<PostData[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { uid: profileUid } = useParams();

  useEffect(() => {
    if (!auth) {
      console.error('auth が null です');
      setLoading(false);
      return;
    }
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (loading) return;

    if (!currentUser) {
      console.log('ユーザーがログインしていません');
      return;
    }

    console.log('Timelineに渡されたorigin:', origin);
    console.log('現在のログインユーザーUID:', currentUser.uid);
    console.log('URLパラメータUID (profileUid):', profileUid);
    console.log('UID (uid):', uid);

    if (!db) {
      console.error('db が null です');
      return;
    }

    const firestore = db as Firestore;

    const postData = collection(firestore, 'posts');
    let q: Query<DocumentData> | null = null;

    if (origin === 'home') {
      q = query(
        postData,
        where('profileUid', '==', currentUser.uid),
        orderBy('timestamp', 'desc')
      );
    } else if (origin === 'user') {
      q = query(
        postData,
        where('profileUid', '==', profileUid),
        where('uid', 'in', [profileUid, currentUser.uid]),
        orderBy('timestamp', 'desc')
      );
    }

    if (q) {
      const unsubscribe = onSnapshot(
        q,
        async (querySnapshot: QuerySnapshot<DocumentData>) => {
          const postsWithReplies = await Promise.all(
            querySnapshot.docs.map(async (doc: QueryDocumentSnapshot<DocumentData>) => {
              const postData = {
                id: doc.id,
                ...(doc.data() as Omit<PostData, 'id' | 'replies'>),
                timestamp: doc.data().timestamp,
                likeCount: doc.data().likeCount || 0,
                replies: [],
              };

              // 返信を取得
              const repliesQuery = query(
                collection(firestore, 'replies'),
                where('postId', '==', doc.id),
                orderBy('createdAt', 'asc')
              );

              const repliesSnapshot = await getDocs(repliesQuery);
              const replies = repliesSnapshot.docs.map((replyDoc: QueryDocumentSnapshot<DocumentData>) => ({
                id: replyDoc.id,
                ...(replyDoc.data() as Omit<ReplyData, 'id' | 'timestamp'>),
                timestamp: replyDoc.data().createdAt.toDate().toLocaleString(),
              }));

              console.log(`Post ${doc.id} replies:`, replies); // デバッグログ

              return { ...postData, replies };
            })
          );

          console.log('Posts with replies:', postsWithReplies); // デバッグログ
          setPosts(postsWithReplies);
        },
        (error: FirestoreError) => {
          console.error('Firestore リスナーエラー:', error);
        }
      );

      return () => {
        console.log('リスナー解除');
        unsubscribe();
      };
    }
  }, [loading, currentUser, origin, profileUid, uid]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!currentUser) {
    return <div>Please log in to view the timeline.</div>;
  }

  return (
    <div className="flex-[1] border-b-0 border-gray-700 xl:flex-[0.6] h-full">
      <TweetBox origin={origin} />
      <FlipMove>
        {posts.length > 0 ? (
          posts.map((post) => {
            const formattedDate = post.timestamp
              ? post.timestamp.toDate().toLocaleString()
              : '';

            console.log(`Rendering post ${post.id} with replies:`, post.replies); // デバッグログ

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
                likeCount={post.likeCount}
                replies={post.replies}
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