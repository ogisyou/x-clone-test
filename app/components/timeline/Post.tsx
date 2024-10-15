import React, { forwardRef, useState } from 'react';
import { Avatar, Tooltip } from '@mui/material';
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
  image?: string;
  avatar?: string;
  postUid: string;
  userId: string;
  timestamp: string;
  likeCount: number;
  replies: ReplyData[];
}

interface PostContentProps {
  isReply: boolean;
  data: PostData | ReplyData;
  onDelete: (id: string, isReply: boolean) => Promise<void>;
  onReplyClick: () => void;
  onToggleReplies: () => void;
  showReplies: boolean;
  repliesCount: number;
}

const Post = forwardRef<HTMLDivElement, PostData>((props, ref) => {
  const [localReplies, setLocalReplies] = useState<ReplyData[]>(props.replies);
  const [isReplyModalOpen, setIsReplyModalOpen] = useState(false);
  const [showReplies, setShowReplies] = useState(false);
  const auth = getAuth();
  const currentUser = auth.currentUser;
  const firestore = getFirestore();

  const handleDelete = async (docId: string, isReply: boolean = false) => {
    try {
      await deleteDoc(doc(firestore, isReply ? 'replies' : 'posts', docId));
      console.log(`${isReply ? '返信' : '投稿'}が正常に削除されました`);
      if (isReply) {
        setLocalReplies((prevReplies) =>
          prevReplies.filter((reply) => reply.id !== docId)
        );
      }
    } catch (error) {
      console.error(
        `${isReply ? '返信' : '投稿'}の削除中にエラーが発生しました:`,
        error
      );
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

  const handleReplyAdded = (newReply: ReplyData) => {
    setLocalReplies((prevReplies) => [...prevReplies, newReply]);
  };

  const PostContent: React.FC<PostContentProps> = ({
    isReply,
    data,
    onDelete,
    onReplyClick,
    onToggleReplies,
    showReplies,
    repliesCount,
  }) => {
    const [isLiked, setIsLiked] = useState(false);

    return (
      <div className="flex flex-col items-start border-b border-gray-700 px-3 pt-1">
        <div className="flex w-full">
          <div className="mt-3 mr-4">
            <Avatar
              className={`w-12 h-12 ${data.avatar ? 'bg-white' : ''}`}
              src={data.avatar}
            />
          </div>
          <div className="flex-1">
            <div className="flex justify-between items-center">
              <h3 className="text-sm mb-1">
                {data.displayName}
                <span className="font-semibold text-xs text-gray-500 ml-2">
                  {!isReply && 'verified' in data && data.verified && (
                    <VerifiedUser className="text-twitter-color !text-sm" />
                  )}{' '}
                  @{data.username}{' '}
                  <span className="ml-3">{data.timestamp}</span>
                </span>
              </h3>

              {currentUser?.uid === data.userId && (
                <div>
                  <button
                    onClick={() => onDelete(data.id, isReply)}
                    className="text-sm text-white bg-black py-1 px-0 rounded hover:bg-gray-700"
                  >
                    削除
                  </button>
                </div>
              )}
            </div>
            <p className="text-sm mb-2">{data.text}</p>
            {!isReply && 'image' in data && data.image && (
              <Image
                className="rounded-xl"
                src={data.image}
                width={150}
                height={150}
                alt="投稿画像"
              />
            )}
            <div className="flex justify-between mt-5 text-white w-full">
              <Tooltip title="返信" arrow>
                <div className="flex items-center group cursor-pointer">
                  <ChatBubbleOutline
                    className="text-base sm:text-xl group-hover:text-blue-400 transition-colors duration-200"
                    onClick={onReplyClick}
                  />
                </div>
              </Tooltip>
              <Tooltip title="リツイート" arrow>
                <div className="flex items-center group cursor-pointer">
                  <Repeat className="text-base sm:text-xl group-hover:text-green-400 transition-colors duration-200" />
                </div>
              </Tooltip>
              <div className="group relative cursor-pointer">
                <LikeButton
                  postId={data.id}
                  initialLikeCount={isReply ? 0 : (data as PostData).likeCount}
                  onLikeToggle={(liked) => setIsLiked(liked)}
                />
                <span className="absolute left-1/2 -translate-x-1/2 top-full mt-1 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                  {isLiked ? 'いいねを取り消す' : 'いいね'}
                </span>
              </div>
              <Tooltip title="表示" arrow>
                <div className="flex items-center group cursor-pointer">
                  <BarChartIcon className="text-base sm:text-xl group-hover:text-blue-400 transition-colors duration-200" />
                </div>
              </Tooltip>
              <div className="flex space-x-2">
                <div className="group relative cursor-pointer">
                  <BookmarkBorderIcon className="text-base sm:text-xl group-hover:text-blue-400 transition-colors duration-200" />
                  <span className="absolute left-1/2 -translate-x-1/2 top-full mt-1 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                    ブックマーク
                  </span>
                </div>
                <Tooltip title="共有" arrow>
                  <div className="flex items-center group cursor-pointer">
                    <PublishOutlined className="text-base sm:text-xl group-hover:text-blue-400 transition-colors duration-200" />
                  </div>
                </Tooltip>
              </div>
              {!isReply && repliesCount > 0 && (
                <button
                  onClick={onToggleReplies}
                  className="text-blue-400 hover:underline"
                >
                  {showReplies
                    ? '返信を非表示'
                    : `${repliesCount}件の返信を表示`}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div ref={ref}>
      <PostContent
        isReply={false}
        data={props}
        onDelete={handleDelete}
        onReplyClick={handleReplyClick}
        onToggleReplies={toggleReplies}
        showReplies={showReplies}
        repliesCount={localReplies.length}
      />
      {localReplies.length > 0 && (
        <div className="mt-2 w-full">
          {showReplies && (
            <div className="mt-2">
              {localReplies.map((reply) => (
                <PostContent
                  key={reply.id}
                  isReply={true}
                  data={reply}
                  onDelete={handleDelete}
                  onReplyClick={handleReplyClick}
                  onToggleReplies={toggleReplies}
                  showReplies={showReplies}
                  repliesCount={0}
                />
              ))}
            </div>
          )}
        </div>
      )}
      <ReplyModal
        isOpen={isReplyModalOpen}
        onClose={handleCloseReplyModal}
        postId={props.id}
        originalPost={{
          displayName: props.displayName,
          username: props.username,
          text: props.text,
          timestamp: props.timestamp,
        }}
        onReplyAdded={handleReplyAdded}
      />
    </div>
  );
});

Post.displayName = 'Post';

export default Post;
