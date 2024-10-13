import React, { useState } from 'react';
import { Modal, Box, TextField, Button, Avatar, Snackbar } from '@mui/material';
import { getAuth } from 'firebase/auth';
import { addDoc, collection, getFirestore, serverTimestamp } from 'firebase/firestore';

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
}

const ReplyModal: React.FC<ReplyModalProps> = ({ isOpen, onClose, postId, originalPost }) => {
  const [replyText, setReplyText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const auth = getAuth();
  const firestore = getFirestore();

  const handleReply = async () => {
    if (replyText.trim() === '') return;

    const user = auth.currentUser;
    if (!user) {
      setSnackbarMessage('ユーザーがログインしていません。');
      setSnackbarOpen(true);
      return;
    }

    setIsSubmitting(true);

    try {
      console.log('Replying to post:', postId);
      console.log('Reply text:', replyText);

      const replyData = {
        text: replyText,
        createdAt: serverTimestamp(),
        userId: user.uid,
        postId: postId,
        displayName: user.displayName || 'Unknown User',
        username: user.email?.split('@')[0] || 'unknown',
        avatar: user.photoURL || '', // ユーザーのアバター画像URLを追加
      };

      console.log('Reply data to be saved:', replyData);

      const docRef = await addDoc(collection(firestore, 'replies'), replyData);

      console.log('Reply saved with ID:', docRef.id);

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
              <Avatar className="w-8 h-8 mr-2" />
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