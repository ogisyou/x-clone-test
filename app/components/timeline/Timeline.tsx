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
  userId: string;
  avatar?: string;
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
  userId: string;
  timestamp: Timestamp;
  likeCount: number;
  replies: ReplyData[];
  repliesUnsubscribe?: () => void;
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
              const postData: PostData = {
                id: doc.id,
                ...(doc.data() as Omit<PostData, 'id' | 'replies' | 'repliesUnsubscribe'>),
                timestamp: doc.data().timestamp,
                likeCount: doc.data().likeCount || 0,
                replies: [],
                userId: doc.data().userId || doc.data().uid,
              };

              const repliesQuery = query(
                collection(firestore, 'replies'),
                where('postId', '==', doc.id),
                orderBy('createdAt', 'desc')
              );

              // 返信のリアルタイムリスナーを設定
              const repliesUnsubscribe = onSnapshot(repliesQuery, (repliesSnapshot) => {
                const replies = repliesSnapshot.docs.map((replyDoc) => {
                  const replyData = replyDoc.data();
                  const createdAt = replyData.createdAt;
                  let timestamp: string;
                  
                  if (createdAt instanceof Timestamp) {
                    timestamp = createdAt.toDate().toLocaleString();
                  } else if (createdAt && typeof createdAt.toDate === 'function') {
                    timestamp = createdAt.toDate().toLocaleString();
                  } else {
                    timestamp = new Date().toLocaleString(); // フォールバック
                    console.warn(`Invalid createdAt for reply ${replyDoc.id}`);
                  }

                  return {
                    id: replyDoc.id,
                    ...(replyData as Omit<ReplyData, 'id' | 'timestamp'>),
                    timestamp,
                    userId: replyData.userId || '',
                  };
                });

                console.log(`Post ${doc.id} replies:`, replies);

                // 投稿の返信を更新
                setPosts((prevPosts) =>
                  prevPosts.map((post) =>
                    post.id === doc.id ? { ...post, replies } : post
                  )
                );
              });

              return { ...postData, repliesUnsubscribe };
            })
          );

          console.log('Posts with replies:', postsWithReplies);
          setPosts(postsWithReplies);
        },
        (error: FirestoreError) => {
          console.error('Firestore リスナーエラー:', error);
        }
      );

      return () => {
        console.log('リスナー解除');
        unsubscribe();
        posts.forEach((post) => post.repliesUnsubscribe && post.repliesUnsubscribe());
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

            console.log(`Rendering post ${post.id} with replies:`, post.replies);

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
                userId={post.userId}
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