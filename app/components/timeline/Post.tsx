import React, { forwardRef, useState } from 'react';
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
import ReplyModal from '@/app/components/timeline/ReplyModal';

interface ReplyData {
  id: string;
  text: string;
  displayName: string;
  username: string;
  timestamp: string;
}

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
  replies: ReplyData[];
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
      replies,
    },
    ref
  ) => {
    const auth = getAuth();
    const currentUser = auth.currentUser;
    const firestore = getFirestore();
    const [isReplyModalOpen, setIsReplyModalOpen] = useState(false);
    const [showReplies, setShowReplies] = useState(false);

    console.log(`Post ${id} component received replies:`, replies); // デバッグログ

    const handleDelete = async () => {
      try {
        await deleteDoc(doc(firestore, 'posts', id));
        console.log('投稿が正常に削除されました');
      } catch (error) {
        console.error('投稿の削除中にエラーが発生しました:', error);
      }
    };

    const handleReplyClick = () => {
      setIsReplyModalOpen(true);
    };

    const handleCloseReplyModal = () => {
      setIsReplyModalOpen(false);
    };

    const toggleReplies = () => {
      setShowReplies(!showReplies);
    };

    return (
      <div
        className="flex flex-col items-start border-b border-gray-700 px-3 pt-1"
        ref={ref}
      >
        <div className="flex w-full">
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
              <ChatBubbleOutline
                className="text-base sm:text-xl cursor-pointer"
                onClick={handleReplyClick}
              />
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
        
        {replies && replies.length > 0 && (
          <div className="mt-2 w-full">
            <button
              onClick={toggleReplies}
              className="text-blue-400 hover:underline"
            >
              {showReplies ? '返信を非表示' : `${replies.length}件の返信を表示`}
            </button>
            {showReplies && (
              <div className="mt-2 pl-8">
                {replies.map((reply) => (
                  <div key={reply.id} className="mb-2 border-l border-gray-600 pl-2">
                    <p className="text-sm">
                      <span className="font-bold">{reply.displayName}</span>{' '}
                      <span className="text-gray-500">@{reply.username}</span>
                    </p>
                    <p className="text-sm">{reply.text}</p>
                    <p className="text-xs text-gray-500">{reply.timestamp}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        
        <ReplyModal
          isOpen={isReplyModalOpen}
          onClose={handleCloseReplyModal}
          postId={id}
          originalPost={{
            displayName,
            username,
            text,
            timestamp,
          }}
        />
      </div>
    );
  }
);

Post.displayName = 'Post';

export default Post;