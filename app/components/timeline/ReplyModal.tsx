import React, { useState, useEffect } from 'react';
import { Modal, Box, TextField, Button, Avatar, Snackbar } from '@mui/material';
import {
  addDoc,
  collection,
  getFirestore,
  serverTimestamp,
  doc,
  getDoc,
} from 'firebase/firestore';
import { useAuth } from '@/app/contexts/AuthContext';

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

interface ReplyModalProps {
  isOpen: boolean;
  onClose: () => void;
  postId: string;
  originalPost: {
    displayName: string;
    username: string;
    text: string;
    timestamp: string;
  };
  onReplyAdded: (newReply: ReplyData) => void;
}

const ReplyModal: React.FC<ReplyModalProps> = ({
  isOpen,
  onClose,
  postId,
  originalPost,
  onReplyAdded,
}) => {
  const [replyText, setReplyText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const { user } = useAuth();
  const [currentUserInfo, setCurrentUserInfo] = useState<{
    displayName: string;
    username: string;
    avatar: string;
  } | null>(null);
  const firestore = getFirestore();

  useEffect(() => {
    const fetchCurrentUserInfo = async () => {
      if (user) {
        const userDoc = await getDoc(doc(firestore, 'users', user.uid));
        const userData = userDoc.data();
        setCurrentUserInfo({
          displayName:
            userData?.displayName || user.displayName || 'Unknown User',
          username: userData?.username || user.displayName || 'unknown',
          avatar: userData?.avatarURL || '',
        });
      }
    };

    fetchCurrentUserInfo();
  }, [user, firestore]);

  const handleReply = async () => {
    if (replyText.trim() === '' || !user || !currentUserInfo) return;

    setIsSubmitting(true);

    try {
      const replyData = {
        text: replyText,
        createdAt: serverTimestamp(),
        userId: user.uid,
        postId: postId,
        displayName: currentUserInfo.displayName,
        username: currentUserInfo.username,
        avatar: currentUserInfo.avatar,
      };

      const docRef = await addDoc(collection(firestore, 'replies'), replyData);

      const newReply: ReplyData = {
        id: docRef.id,
        ...replyData,
        timestamp: new Date().toLocaleString(),
      };

      onReplyAdded(newReply);

      setReplyText('');
      setSnackbarMessage('返信が投稿されました。');
      setSnackbarOpen(true);
      onClose();
    } catch (error) {
      console.error('返信の投稿中にエラーが発生しました:', error);
      setSnackbarMessage('返信の投稿中にエラーが発生しました。');
      setSnackbarOpen(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Modal open={isOpen} onClose={onClose}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 400,
            bgcolor: 'black',
            border: '1px solid',
            borderColor: 'gray',
            boxShadow: 24,
            p: 4,
            borderRadius: 2,
          }}
        >
          <div className="mb-4">
            <div className="flex items-center mb-2">
              <Avatar
                src={currentUserInfo?.avatar}
                className="!w-16 !h-16 mr-2"
                sx={{
                  bgcolor: currentUserInfo?.avatar ? 'white' : undefined,
                  '& img': {
                    objectFit: 'cover',
                  },
                }}
              />
              <div>
                <p className="font-bold text-2xl">
                  {currentUserInfo?.displayName}
                </p>
                <p className="text-gray-500 ml-2">
                  @{currentUserInfo?.username}
                </p>
              </div>
            </div>
            <p>{originalPost.text}</p>
            <p className="text-gray-500 text-sm mt-1 ">
              {originalPost.timestamp}
            </p>
          </div>
          <TextField
            fullWidth
            multiline
            rows={4}
            variant="outlined"
            placeholder="返信を入力"
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            className="mb-4 bg-black"
            sx={{
              '& .MuiInputBase-input': {
                color: 'white',
              },
              '& .MuiInputLabel-root': {
                color: 'white',
              },
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  borderColor: 'gray',
                },
                '&:hover fieldset': {
                  borderColor: 'gray',
                },
                '&.Mui-focused fieldset': {
                  borderColor: 'gray',
                },
              },
            }}
          />

          <div className="flex justify-end mt-5">
            <Button
              variant="contained"
              onClick={handleReply}
              className="!bg-blue-600 !text-white hover:!bg-blue-800"
              disabled={
                replyText.trim() === '' || isSubmitting || !currentUserInfo
              }
            >
              {isSubmitting ? '投稿中...' : '返信'}
            </Button>
          </div>
        </Box>
      </Modal>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        message={snackbarMessage}
      />
    </>
  );
};

export default ReplyModal;
