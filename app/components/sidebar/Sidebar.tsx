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
import { getAuth, signOut, User } from 'firebase/auth'; // User型をインポート
import { useRouter } from 'next/router'; // useNavigate ではなく useRouter をインポート
import XIcon from '@mui/icons-material/X';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase'; // Firebaseの設定ファイルのパスを調整してください

import '../../index.css';
import Link from 'next/link';

// SidebarProps 型定義を追加
interface SidebarProps {
  username?: string; // username はオプションのプロパティとして定義
}

// currentUser の型を定義
interface CurrentUser {
  uid: string;
  displayName: string;
  avatarURL?: string;
}

// Sidebar コンポーネントに SidebarProps を適用
function Sidebar({ username }: SidebarProps) {
  const [avatar, setAvatar] = useState<string>('');
  const auth = getAuth();
  const router = useRouter(); // useNavigate の代わりに useRouter を使用
  const [openLogoutDialog, setOpenLogoutDialog] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null); // currentUser の型を指定

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        if (auth.currentUser) {
          setCurrentUser({
            uid: auth.currentUser.uid,
            displayName: auth.currentUser.displayName || '',
          });
          const userDoc = doc(db, 'users', auth.currentUser.uid);
          const userSnap = await getDoc(userDoc);
  
          if (userSnap.exists()) {
            const userData = userSnap.data();
            setAvatar(userData.avatarURL || ''); // avatarURL が存在する場合はその URL を設定
          }
        } else {
          // ゲストの場合の処理
          setCurrentUser({ uid: 'guest', displayName: 'Guest_User' });
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };
  
    fetchUserData();
  }, [auth.currentUser]);

  const handleLogout = () => {
    signOut(auth)
      .then(() => {
        router.push('/login'); // navigate ではなく router.push を使用
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

  if (!currentUser) {
    return null; // currentUser が設定されるまでローディング表示
  }

  return (
    <div className="hidden sm:block sm:text-2xl sm:font-bold border-r sm:border-gray-700 sm:flex-[0.2] xl:min-w-[250px] pr-5">
      <div className="flex items-center ml-6 mb-4 mt-5">
        <Link
          href={`/home/${currentUser.uid}`} // to 属性ではなく href を使用
          className="flex items-center p-4 w-full rounded-full hover:bg-gray-800"
        >
          <XIcon className="!text-3xl " />
          <h2 className="ml-4 text-blue-400 hidden xl:block">{username || currentUser.displayName}</h2>
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

        <Button
          variant="outlined"
          className="hidden xl:block !bg-blue-400 !mt-8 !border-none !h-12 !w-full custom-button"
        >
          ポストする
        </Button>

        <Button
          variant="outlined"
          className="custom-button !mt-8 !h-12 !w-full hidden xl:block"
          onClick={handleOpenDialog}
        >
          ログアウト
        </Button>
        <div className="block xl:hidden cursor-pointer mt-3 ml-8">
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
