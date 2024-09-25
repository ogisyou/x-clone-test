import React, { forwardRef } from 'react';
import { Avatar } from '@mui/material';
import VerifiedUser from '@mui/icons-material/VerifiedUser';
import {
  ChatBubbleOutline,
  Repeat,
  FavoriteBorder,
  PublishOutlined,
} from '@mui/icons-material';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import BarChartIcon from '@mui/icons-material/BarChart';
import { deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase';
import { getAuth } from 'firebase/auth';

const Post = forwardRef(
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
    },
    ref
  ) => {
    const auth = getAuth();
    const currentUser = auth.currentUser;

    // コンソールでログインユーザーのUIDを確認
    // console.log('Current User UID:', currentUser?.uid);
    // console.log('Post UID:', postUid);

    const handleDelete = async () => {
      await deleteDoc(doc(db, 'posts', id));
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
                @{username} <span className='ml-3'>{timestamp}</span>
              </span>
            </h3>

            {/* 削除ボタン：自分の投稿のみ表示 */}
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
            <img className="rounded-xl w-full" src={image} alt="投稿画像" />
          )}
          <div className="flex justify-between mt-5 text-white">
            <ChatBubbleOutline className="text-base sm:text-xl" />
            <Repeat className="text-base sm:text-xl" />
            <FavoriteBorder className="text-base sm:text-xl" />
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

export default Post;
