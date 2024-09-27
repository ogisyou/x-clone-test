import React, { useState, useEffect } from 'react';
import { doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { db } from '../../firebase';

interface FollowButtonProps {
  userId: string;
  following: Set<string>;
  onFollowChange?: (userId: string, isFollowing: boolean) => void;
}

const FollowButton: React.FC<FollowButtonProps> = ({ userId, following, onFollowChange }) => {
  const [isFollowing, setIsFollowing] = useState(false);

  const auth = getAuth();
  const currentUser = auth.currentUser;

  useEffect(() => {
    setIsFollowing(following.has(userId));
  }, [following, userId]);

  const handleFollow = async () => {
    if (!currentUser) {
      console.error('ユーザーがログインしていません');
      return;
    }

    try {
      // フォローデータを更新
      const currentUserDocRef = doc(db, 'users', currentUser.uid);
      await updateDoc(currentUserDocRef, {
        following: arrayUnion(userId),
      });

      // フォローしたユーザーのドキュメントも更新
      const userDocRef = doc(db, 'users', userId);
      await updateDoc(userDocRef, {
        followers: arrayUnion(currentUser.uid),
      });

      setIsFollowing(true);
      if (onFollowChange) onFollowChange(userId, true);
    } catch (error) {
      console.error('Error following user:', error);
    }
  };

  const handleUnfollow = async () => {
    if (!currentUser) {
      console.error('ユーザーがログインしていません');
      return;
    }

    try {
      // フォローデータを更新
      const currentUserDocRef = doc(db, 'users', currentUser.uid);
      await updateDoc(currentUserDocRef, {
        following: arrayRemove(userId),
      });

      // フォロー解除したユーザーのドキュメントも更新
      const userDocRef = doc(db, 'users', userId);
      await updateDoc(userDocRef, {
        followers: arrayRemove(currentUser.uid),
      });

      setIsFollowing(false);
      if (onFollowChange) onFollowChange(userId, false);
    } catch (error) {
      console.error('Error unfollowing user:', error);
    }
  };

  return (
    <button onClick={isFollowing ? handleUnfollow : handleFollow}>
      {isFollowing ? 'フォロー中' : 'フォロー'}
    </button>
  );
};

export default FollowButton;