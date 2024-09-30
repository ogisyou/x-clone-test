import React, { useState, useEffect } from 'react';
import { doc, updateDoc, arrayUnion, arrayRemove, getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

interface FollowButtonProps {
  userId: string;
  following: Set<string>;
  onFollowChange?: (userId: string, isFollowing: boolean) => void;
}

const FollowButton: React.FC<FollowButtonProps> = ({
  userId,
  following,
  onFollowChange,
}) => {
  const [isFollowing, setIsFollowing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const auth = getAuth();
  const currentUser = auth.currentUser;
  const db = getFirestore() ?? null;

  useEffect(() => {
    setIsFollowing(following.has(userId));
  }, [following, userId]);

  const handleFollowAction = async (action: 'follow' | 'unfollow') => {
    if (!currentUser) {
      setError('ユーザーがログインしていません');
      return;
    }

    if (!db) {
      setError('Firestoreが初期化されていません');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const currentUserDocRef = doc(db, 'users', currentUser.uid);
      const userDocRef = doc(db, 'users', userId);

      if (action === 'follow') {
        await updateDoc(currentUserDocRef, { following: arrayUnion(userId) });
        await updateDoc(userDocRef, { followers: arrayUnion(currentUser.uid) });
        setIsFollowing(true);
      } else {
        await updateDoc(currentUserDocRef, { following: arrayRemove(userId) });
        await updateDoc(userDocRef, { followers: arrayRemove(currentUser.uid) });
        setIsFollowing(false);
      }

      if (onFollowChange) onFollowChange(userId, action === 'follow');
    } catch (error) {
      console.error(`${action === 'follow' ? 'フォロー' : 'フォロー解除'}中にエラーが発生しました:`, error);
      setError(`${action === 'follow' ? 'フォロー' : 'フォロー解除'}に失敗しました`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <button
        className="w-24 font-bold rounded-full p-1  mt-3 mr-3 text-black !border-white border bg-white hover:bg-gray-300"
        onClick={() => handleFollowAction(isFollowing ? 'unfollow' : 'follow')}
        disabled={isLoading}
      >
        {isFollowing ? 'フォロー中' : 'フォロー'}
      </button>
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
};

export default FollowButton;