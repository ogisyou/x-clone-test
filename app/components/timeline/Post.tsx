// app/components/timeline/Post.tsx
import React, { forwardRef, useEffect } from 'react';
import { Avatar } from '@mui/material';
import VerifiedUser from '@mui/icons-material/VerifiedUser';
import {
  ChatBubbleOutline,
  Repeat,
  PublishOutlined,
} from '@mui/icons-material';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import BarChartIcon from '@mui/icons-material/BarChart';
import { deleteDoc, doc, getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import Image from 'next/image';
import LikeButton from '@/app/components/common/LikeButton';

interface PostData {
  id: string;
  displayName: string;
  username: string;
  verified: boolean;
  text: string;
  image?: string;
  avatar?: string;
  postUid: string;
  timestamp: string;
  likeCount: number;
}

const Post = forwardRef<HTMLDivElement, PostData>(
  (
    {
      id,
      displayName,
      username,
      verified,
      text,
      image,
      avatar,
      postUid,
      timestamp,
      likeCount,
    },
    ref
  ) => {
    const auth = getAuth();
    const currentUser = auth.currentUser;
    const firestore = getFirestore();

    useEffect(() => {
      console.log(`Post ${id} likeCount:`, likeCount);
      console.log(`Post ${id} likeCount type:`, typeof likeCount);
    }, [id, likeCount]);

    const handleDelete = async () => {
      try {
        await deleteDoc(doc(firestore, 'posts', id));
        console.log('投稿が正常に削除されました');
      } catch (error) {
        console.error('投稿の削除中にエラーが発生しました:', error);
      }
    };

    return (
      <div
        className="flex items-start border-b border-gray-700 px-3 pt-1"
        ref={ref}
      >
        <div className="mt-3 mr-4">
          <Avatar
            className={`w-12 h-12 ${avatar ? 'bg-white' : ''}`}
            src={avatar}
          />
        </div>
        <div className="flex-1">
          <div className="flex justify-between items-center">
            <h3 className="text-sm mb-1">
              {displayName}
              <span className="font-semibold text-xs text-gray-500 ml-2">
                {verified && (
                  <VerifiedUser className="text-twitter-color !text-sm" />
                )}{' '}
                @{username} <span className="ml-3">{timestamp}</span>
              </span>
            </h3>

            {currentUser?.uid === postUid && (
              <div>
                <button
                  onClick={handleDelete}
                  className="text-sm text-white bg-black py-1 px-0 rounded hover:bg-gray-700"
                >
                  削除
                </button>
              </div>
            )}
          </div>
          <p className="text-sm mb-2">{text}</p>
          {image && (
            <Image
              className="rounded-xl"
              src={image}
              width={150}
              height={150}
              alt="投稿画像"
            />
          )}
          <div className="flex justify-between mt-5 text-white">
            <ChatBubbleOutline className="text-base sm:text-xl" />
            <Repeat className="text-base sm:text-xl" />
            <LikeButton postId={id} initialLikeCount={likeCount ?? 0} />
            <BarChartIcon className="text-base sm:text-xl" />
            <div className="flex space-x-2">
              <BookmarkBorderIcon className="text-base sm:text-xl" />
              <PublishOutlined className="text-base sm:text-xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }
);

Post.displayName = 'Post';

export default Post;