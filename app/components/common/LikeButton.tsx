import React, { useState, useEffect } from 'react';
import { Favorite, FavoriteBorder } from '@mui/icons-material';
import { doc, setDoc, deleteDoc, getDoc, getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

interface LikeButtonProps {
  postId: string;
  initialLikeCount: number;
  onLikeToggle: (liked: boolean) => void;
}

const LikeButton: React.FC<LikeButtonProps> = ({ postId, initialLikeCount, onLikeToggle }) => {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const firestore = getFirestore();
  const auth = getAuth();
  const currentUser = auth.currentUser;

  useEffect(() => {
    const fetchLikeStatus = async () => {
      if (currentUser) {
        const likeRef = doc(firestore, 'posts', postId, 'likes', currentUser.uid);
        const likeDoc = await getDoc(likeRef);
        setLiked(likeDoc.exists());
      }
    };

    const fetchLikeCount = async () => {
      const postRef = doc(firestore, 'posts', postId);
      const postDoc = await getDoc(postRef);
      const fetchedLikeCount = postDoc.data()?.likeCount;
      setLikeCount(Number(fetchedLikeCount) || 0);
    };

    fetchLikeStatus();
    fetchLikeCount();
  }, [postId, currentUser, firestore]);

  const handleLike = async () => {
    if (!currentUser) return;

    const likeRef = doc(firestore, 'posts', postId, 'likes', currentUser.uid);
    const postRef = doc(firestore, 'posts', postId);

    try {
      if (liked) {
        await deleteDoc(likeRef);
        await setDoc(postRef, { likeCount: Math.max(0, likeCount - 1) }, { merge: true });
        setLiked(false);
        setLikeCount(prev => Math.max(0, prev - 1));
      } else {
        await setDoc(likeRef, { userId: currentUser.uid });
        await setDoc(postRef, { likeCount: likeCount + 1 }, { merge: true });
        setLiked(true);
        setLikeCount(prev => prev + 1);
      }
      onLikeToggle(!liked);  // 親コンポーネントに新しい状態を通知
    } catch (error) {
      console.error('いいねの更新中にエラーが発生しました:', error);
    }
  };

  return (
    <div className="flex items-center">
      <button onClick={handleLike} className="flex items-center">
        {liked ? (
          <Favorite className="text-red-500 text-base sm:text-xl" />
        ) : (
          <FavoriteBorder className="text-base sm:text-xl" />
        )}
        <span className="ml-1">{likeCount}</span>
      </button>
    </div>
  );
};

export default LikeButton;