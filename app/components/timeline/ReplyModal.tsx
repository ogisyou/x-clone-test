import React, { useState, useEffect } from 'react';
import { Modal, Box, TextField, Button, Avatar, Snackbar } from '@mui/material';
import { getAuth } from 'firebase/auth';
import { addDoc, collection, getFirestore, serverTimestamp, doc, getDoc } from 'firebase/firestore';
import { useAvatar } from '@/app/contexts/AvatarContext';

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

const ReplyModal: React.FC<ReplyModalProps> = ({ isOpen, onClose, postId, originalPost, onReplyAdded }) => {
  const [replyText, setReplyText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [userInfo, setUserInfo] = useState<{ displayName: string; username: string } | null>(null);
  const { avatar } = useAvatar(); // AvatarContext から avatar を取得
  const auth = getAuth();
  const firestore = getFirestore();

  useEffect(() => {
    const fetchUserInfo = async () => {
      const user = auth.currentUser;
      if (user) {
        const userDoc = await getDoc(doc(firestore, 'users', user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setUserInfo({
            displayName: userData.displayName || 'Unknown User',
            username: userData.username || 'unknown',
          });
        }
      }
    };

    fetchUserInfo();
  }, [auth, firestore]);

  const handleReply = async () => {
    if (replyText.trim() === '') return;

    const user = auth.currentUser;
    if (!user || !userInfo) {
      setSnackbarMessage('ユーザー情報を取得できませんでした。');
      setSnackbarOpen(true);
      return;
    }

    setIsSubmitting(true);

    try {
      const replyData = {
        text: replyText,
        createdAt: serverTimestamp(),
        userId: user.uid,
        postId: postId,
        displayName: userInfo.displayName,
        username: userInfo.username,
        avatar: avatar, // AvatarContext から取得したアバターを使用
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
            bgcolor: 'background.paper',
            boxShadow: 24,
            p: 4,
            borderRadius: 2,
          }}
        >
          <div className="mb-4">
            <div className="flex items-center mb-2">
              <Avatar src={avatar} className="w-8 h-8 mr-2" />
              <span className="font-bold">{originalPost.displayName}</span>
              <span className="text-gray-500 ml-2">@{originalPost.username}</span>
            </div>
            <p>{originalPost.text}</p>
            <p className="text-gray-500 text-sm mt-1">{originalPost.timestamp}</p>
          </div>
          <TextField
            fullWidth
            multiline
            rows={4}
            variant="outlined"
            placeholder="返信を入力"
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            className="mb-4"
          />
          <div className="flex justify-end">
            <Button
              variant="contained"
              onClick={handleReply}
              disabled={replyText.trim() === '' || isSubmitting}
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