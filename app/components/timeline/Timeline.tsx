import React, { useState, useEffect } from 'react';
import TweetBox from './TweetBox';
import Post from './Post';
import { db, auth } from '../../firebase'; // Firebase auth をインポート
import { collection, onSnapshot, orderBy, query, where} from 'firebase/firestore';
import FlipMove from 'react-flip-move';
import { useParams } from 'react-router-dom'; // URLからUIDを取得するため
import { getAuth, signInAnonymously } from 'firebase/auth'; // Firebase匿名認証

function Timeline({ origin }) {
  const [posts, setPosts] = useState([]);
  const { uid: profileUid } = useParams(); // URLパラメータからUIDを取得
  const [currentUser, setCurrentUser] = useState(auth.currentUser); // 現在のログインユーザーのUIDを取得

  // ゲストユーザーとしてサインインする関数
  const signInAsGuest = async () => {
    const auth = getAuth();
    try {
      const guestUser = await signInAnonymously(auth);
      setCurrentUser(guestUser.user); // ゲストユーザーをセット
      console.log('ゲストとしてサインイン:', guestUser.user);
    } catch (error) {
      console.error('ゲストサインイン中にエラーが発生しました:', error);
    }
  };

  useEffect(() => {
    if (!currentUser) {
      signInAsGuest(); // 現在のユーザーが存在しない場合はゲストとしてサインイン
    }
  }, [currentUser]);

  useEffect(() => {
    if (!currentUser || !profileUid) return; // UIDが未取得ならクエリ実行しない

    console.log('Timelineに渡されたorigin:', origin); // デバッグ用
    console.log('現在のログインユーザーUID:', currentUser.uid); // デバッグ用
    console.log('URLパラメータUID (profileUid):', profileUid); // デバッグ用

    const postData = collection(db, 'posts');

    // クエリの条件を作成
    let q;

    if (origin === 'home') {
      q = query(
        postData,
        where('profileUid', '==', currentUser.uid), // 現在のログインユーザーのUID
        orderBy('timestamp', 'desc') // 時間でソート
      );
    } else if (origin === 'user') {
      q = query(
        postData,
        where('uid', '==', currentUser.uid), // 現在のログインユーザーのUID
        where('profileUid', '==', profileUid), // URLパラメータUID
        where('origin', '==', 'user'), // originがuserの場合
        orderBy('timestamp', 'desc') // 時間でソート
      );
    }

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      try {
        const allPosts = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setPosts(allPosts);
      } catch (err) {
        console.error('投稿の取得中にエラーが発生しました:', err);
      }
    }, (error) => {
      console.error('Firestore リスナーエラー:', error);
    });

    return () => {
      console.log('リスナー解除');
      unsubscribe();
    };
  }, [origin, profileUid, currentUser]);

  return (
    <div className="flex-[1] border-b-0 border-gray-700 xl:flex-[0.45] h-full">
      <TweetBox origin={origin} uid={profileUid} />
  
      <FlipMove>
      {posts.length > 0 ? (
        posts.map((post) => {
          // タイムスタンプをDateオブジェクトに変換し、フォーマットする
          const timestamp = post.timestamp?.toDate();
          const formattedDate = timestamp
            ? timestamp.toLocaleString() // 日時をフォーマット
            : '';
  
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
              timestamp={formattedDate} // フォーマットされた日付を渡す
            />
          );
        })
      ) : (
        <p className="text-gray-500">投稿がありません</p>
      )}
      </FlipMove>
    </div>
  );
}

export default Timeline;
