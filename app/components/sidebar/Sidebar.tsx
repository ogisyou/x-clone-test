// app/components/sidebar/Sidebar.tsx
'use client';

import React, { useState, useEffect } from 'react';
import SidebarOption from './SidebarOption';
import HomeIcon from '@mui/icons-material/Home';
import SearchIcon from '@mui/icons-material/Search';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import PermIdentityIcon from '@mui/icons-material/PermIdentity';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import GroupIcon from '@mui/icons-material/Group';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import CropSquareIcon from '@mui/icons-material/CropSquare';
import {
  Button,
  Avatar,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from '@mui/material';
import { getAuth, signOut, onAuthStateChanged } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import XIcon from '@mui/icons-material/X';
import { doc, Firestore, getDoc } from 'firebase/firestore';
import { db } from '../../firebase';

import '../../globals.css';
import Link from 'next/link';

interface SidebarProps {
  username: string;
  className: string;
}

interface CurrentUser {
  uid: string;
  displayName: string;
  avatarURL?: string;
}

function Sidebar({ username, className }: SidebarProps) {
  const [avatar, setAvatar] = useState<string>('');
  const auth = getAuth();
  const router = useRouter();
  const [openLogoutDialog, setOpenLogoutDialog] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      if (authUser) {
        try {
          const userDoc = doc(db as Firestore, 'users', authUser.uid);
          const userSnap = await getDoc(userDoc);

          if (userSnap.exists()) {
            const userData = userSnap.data();

            setCurrentUser({
              uid: authUser.uid,
              displayName: authUser.displayName || '',
              avatarURL: userData.avatarURL || '',
            });
            setAvatar(userData.avatarURL || '');
          } else {
            setCurrentUser({ uid: authUser.uid, displayName: '' });
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      } else {
        setCurrentUser({ uid: 'guest', displayName: '' });
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [auth]);

  const handleLogout = () => {
    signOut(auth)
      .then(() => {
        localStorage.removeItem('isAuth');
        localStorage.removeItem('uid');
        router.push('/login');
      })
      .catch((error) => {
        console.error('Logout error:', error);
      });
  };

  const handleOpenDialog = () => {
    setOpenLogoutDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenLogoutDialog(false);
  };

  const handleConfirmLogout = () => {
    handleLogout();
    setOpenLogoutDialog(false);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!currentUser) {
    return null;
  }

  return (
    <div
      className={`hidden sm:block sm:text-2xl sm:font-bold border-r sm:border-gray-700 sm:flex-[0.2] xl:min-w-[250px] pr-5 ${className}`}
    >
      <div className="flex items-center ml-6 mb-3 mt-5">
        <Link
          href={`/home/${currentUser.uid}`}
          className="flex items-center p-3 w-full rounded-full hover:bg-gray-800"
        >
          <XIcon className="text-xl" />
          <h2 className="ml-4 text-blue-400 hidden xl:block">
            {username || currentUser.displayName}
          </h2>
        </Link>
      </div>
      <div>
        <SidebarOption
          text="ホーム"
          Icon={HomeIcon}
          customClasses="hidden xl:!block"
        />
        <SidebarOption
          text="話題を検索"
          Icon={SearchIcon}
          customClasses="hidden xl:!block"
        />
        <SidebarOption
          text="通知"
          Icon={NotificationsNoneIcon}
          customClasses="hidden xl:!block"
        />
        <SidebarOption
          text="メッセージ"
          Icon={MailOutlineIcon}
          customClasses="hidden xl:!block"
        />
        <SidebarOption
          text="Grok"
          Icon={CropSquareIcon}
          customClasses="hidden xl:!block"
        />
        <SidebarOption
          text="ブックマーク"
          Icon={BookmarkBorderIcon}
          customClasses="hidden xl:!block"
        />
        <SidebarOption
          text="コミュニティ"
          Icon={GroupIcon}
          customClasses="hidden xl:!block"
        />
        <SidebarOption
          text="プレミアム"
          Icon={XIcon}
          customClasses="hidden xl:!block"
        />
        <SidebarOption
          text="認証済み組織"
          Icon={VerifiedUserIcon}
          customClasses="hidden xl:!block"
        />
        <SidebarOption
          text="プロフィール"
          Icon={PermIdentityIcon}
          customClasses="hidden xl:!block"
        />
        <SidebarOption
          text="もっとみる"
          Icon={MoreHorizIcon}
          customClasses="hidden xl:!block"
        />
        <div className="hidden xl:block">
          <Button
            variant="outlined"
            className="!bg-blue-400 !mt-8 !border-none !h-12 !w-full custom-button"
          >
            ポストする
          </Button>
        </div>
        <div className="hidden xl:block">
          <Button
            variant="outlined"
            className="custom-button !mt-8 !h-12 !w-full hidden xl:block"
            onClick={handleOpenDialog}
          >
            ログアウト
          </Button>
        </div>
        <div className="block xl:hidden cursor-pointer mt-3 ml-7">
          <Avatar
            src={avatar}
            onClick={handleOpenDialog}
            className={`${avatar ? 'bg-white' : ''}`}
          ></Avatar>
        </div>

        <Dialog open={openLogoutDialog} onClose={handleCloseDialog}>
          <DialogTitle>ログアウト</DialogTitle>
          <DialogContent>
            <p>ログアウトしますか？</p>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleConfirmLogout} color="primary">
              はい
            </Button>
            <Button onClick={handleCloseDialog}>いいえ</Button>
          </DialogActions>
        </Dialog>
      </div>
    </div>
  );
}

export default Sidebar;
