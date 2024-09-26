import React, { useState, useEffect, useRef } from 'react';
import {
  Avatar,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  Drawer,
} from '@mui/material';
import InsertPhotoIcon from '@mui/icons-material/InsertPhoto';
import GifBoxIcon from '@mui/icons-material/GifBox';
import BallotIcon from '@mui/icons-material/Ballot';
import CakeIcon from '@mui/icons-material/Cake';
import SentimentSatisfiedAltIcon from '@mui/icons-material/SentimentSatisfiedAlt';
import EventNoteIcon from '@mui/icons-material/EventNote';
import PlaceIcon from '@mui/icons-material/Place';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import SidebarOption from '../sidebar/SidebarOption';
import ArticleIcon from '@mui/icons-material/Article';
import PaymentsIcon from '@mui/icons-material/Payments';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import PermIdentityIcon from '@mui/icons-material/PermIdentity';
import SettingsIcon from '@mui/icons-material/Settings';
import CardTravelIcon from '@mui/icons-material/CardTravel';
import LogoutIcon from '@mui/icons-material/Logout';
import XIcon from '@mui/icons-material/X';
import { useRouter } from 'next/router';
import { useAvatar } from '../../contexts/AvatarContext';
import { useBackground } from '../../contexts/BackgroundContext';
import {
  collection,
  addDoc,
  serverTimestamp,
  doc,
  getDoc,
} from 'firebase/firestore';
import { db, storage } from '../../firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getAuth, signOut } from 'firebase/auth';
import Link from 'next/link';

interface Profile {
  bio: string;
  birthplace: string;
  birthDate: string;
}

interface TweetBoxProps {
  origin: string;
}

const TweetBox: React.FC<TweetBoxProps> = ({ origin }) => {
  const auth = getAuth();
  const router = useRouter();
  const { uid } = router.query; // URL パラメータから uid を取得
  const currentUser = auth.currentUser;
  const { avatar, setAvatar } = useAvatar();
  const [backgroundURL, setBackgroundURL] = useBackground();
  const [tweetMessage, setTweetMessage] = useState<string>('');
  const [tweetImage, setTweetImage] = useState<File | null>(null);
  const [displayName, setDisplayName] = useState<string>('');
  const [username, setUsername] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [openDrawer, setOpenDrawer] = useState<boolean>(false);
  const [openLogoutDialog, setOpenLogoutDialog] = useState<boolean>(false);
  const [followingCount, setFollowingCount] = useState<number>(0);
  const [followersCount, setFollowersCount] = useState<number>(0);
  const [currentUid, setCurrentUid] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [bio, setBio] = useState<string>('');
  const [profile, setProfile] = useState<Profile>({
    bio: '',
    birthplace: '',
    birthDate: '',
  });

  useEffect(() => {
    // ログインしているユーザーのUIDを設定
    if (currentUser) {
      setCurrentUid(currentUser.uid);
    }

    // 他のユーザーのプロフィールを取得
    const fetchProfile = async () => {
      try {
        const userDocRef = doc(db, 'users', uid as string);
        const docSnap = await getDoc(userDocRef);

        if (docSnap.exists()) {
          const userData = docSnap.data();
          setDisplayName(userData.displayName || '');
          setUsername(userData.username || '');
          setAvatar(userData.avatarURL || '');
          setBackgroundURL(userData.backgroundURL || '');
          setBio(userData.bio || '');
          setProfile({
            bio: userData.bio || '',
            birthplace: userData.birthplace || '',
            birthDate: userData.birthDate || '',
          });
          setFollowingCount(userData.following ? userData.following.length : 0);
          setFollowersCount(userData.followers ? userData.followers.length : 0);
        } else {
          console.log('プロフィールデータが見つかりません');
        }
      } catch (error) {
        console.error('プロフィールの取得中にエラーが発生しました:', error);
      }
    };

    fetchProfile();
  }, [uid, setAvatar, setBackgroundURL, currentUser]);

  const sendTweet = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      let avatarURL = avatar;
      let displayName = currentUser ? currentUser.displayName : 'ゲストユーザー'; // ゲストユーザーの場合のデフォルト名
      let userUid = currentUser ? currentUser.uid : `guest_${uid}`; // ゲストユーザーには一意のUIDを設定

      // ゲストユーザーの場合の処理
      if (!currentUser) {
        avatarURL = avatar || ''; // デフォルトのアバターまたは空の文字列
      } else {
        // ログイン済みユーザーの情報をFirestoreから取得
        const userDocRef = doc(db, 'users', currentUser.uid);
        const userSnap = await getDoc(userDocRef);

        if (userSnap.exists()) {
          const userData = userSnap.data();
          avatarURL = userData.avatarURL || ''; // ユーザーのアバターURLを取得、存在しない場合は空文字
          displayName = userData.displayName || currentUser.displayName;
        } else {
          console.log('ユーザー情報が見つかりません');
        }
      }

      // アバター画像が変更された場合のアップロード処理
      if (selectedFile) {
        const uniqueFileName = `${Date.now()}_${selectedFile.name}`;
        const storageRef = ref(storage, `avatars/${uniqueFileName}`);
        await uploadBytes(storageRef, selectedFile);
        avatarURL = await getDownloadURL(storageRef);
      }

      // 画像が選択されている場合はアップロード
      let tweetImageUrl = '';
      if (tweetImage) {
        const uniqueImageName = `${Date.now()}_${tweetImage.name}`;
        const imageRef = ref(storage, `posts/${uniqueImageName}`);
        await uploadBytes(imageRef, tweetImage);
        tweetImageUrl = await getDownloadURL(imageRef);
      }

      // Firestoreに投稿データを追加
      await addDoc(collection(db, 'posts'), {
        displayName: displayName,
        username: displayName, // ゲストユーザーの場合のユーザー名
        verified: !!currentUser, // ログイン済みユーザーの場合は認証済み
        text: tweetMessage,
        avatar: avatarURL,
        image: tweetImageUrl,
        timestamp: serverTimestamp(),
        uid: userUid, // ログインしているユーザーまたはゲストのUID
        profileUid: uid, // URLパラメータから取得したUID
        origin: origin, // origin情報を保持
      });

      // 投稿後のリセット
      setTweetMessage('');
      setTweetImage(null);
      setSelectedFile(null);
    } catch (error) {
      console.error('投稿中にエラーが発生しました:', error);
    }
  };

  const toggleDrawer = (open: boolean) => {
    setOpenDrawer(open);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/login');
    } catch (error) {
      console.error('ログアウト中にエラーが発生しました:', error);
    }
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files ? event.target.files[0] : null;
    setTweetImage(file);
    event.target.value = '';
  };

  return (
    <div className="relative px-4 py-2 border-b-8 border-gray-700">
      <div
        className="w-full h-52 bg-gray-800"
        style={{
          backgroundImage: `url(${backgroundURL})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      ></div>
      <Avatar
        className={`absolute top-36 w-32 h-32 mt-1 border-4 border-black cursor-pointer xl:cursor-default ${
          avatar ? 'bg-white' : ''
        }`}
        src={avatar}
        onClick={() => toggleDrawer(true)}
      />
      <div className="text-end mt-4">
        {/* デバッグログを追加 */}
        console.log('Current UID:', currentUid, 'Requested UID:', uid)
        <div
          className={`${
            currentUid === uid || uid?.includes('guest') ? '' : 'invisible'
          }`}
        >
          <Link
            href={`/profile/${uid}`}
            className="text-white p-2 rounded-3xl border hover:bg-gray-700 bg-black font-bold"
          >
            プロフィールを編集
          </Link>
        </div>
        <div className="text-white flex gap-1">
          <h3 className="text-lg">{displayName}</h3>
          <span className="text-gray-400">@{username}</span>
        </div>
      </div>

      {/* ツイートボックス */}
      <form onSubmit={sendTweet} className="mt-10 flex flex-col">
        <textarea
          className="resize-none h-24 p-3 border rounded-md outline-none"
          value={tweetMessage}
          onChange={(e) => setTweetMessage(e.target.value)}
          placeholder="ツイートを入力..."
          maxLength={280}
        />
        {tweetImage && (
          <div className="relative">
            <img
              src={URL.createObjectURL(tweetImage)}
              alt="Selected"
              className="mt-2 w-full h-auto rounded-md"
            />
            <button
              type="button"
              onClick={() => setTweetImage(null)}
              className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1"
            >
              <XIcon />
            </button>
          </div>
        )}
        <div className="flex justify-between items-center mt-2">
          <div className="flex items-center">
            <label htmlFor="tweetImage" className="cursor-pointer">
              <InsertPhotoIcon className="text-blue-500 mr-2" />
              <input
                id="tweetImage"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </label>
            <GifBoxIcon className="text-blue-500" />
            <SentimentSatisfiedAltIcon className="text-blue-500" />
            <EventNoteIcon className="text-blue-500" />
            <PlaceIcon className="text-blue-500" />
          </div>
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded-md"
          >
            ツイート
          </button>
        </div>
      </form>

      {/* ドロワー */}
      <Drawer anchor="right" open={openDrawer} onClose={() => toggleDrawer(false)}>
        <div className="w-60 h-full p-4">
          <h3 className="text-xl">メニュー</h3>
          <div className="flex flex-col mt-4">
            <SidebarOption text="プロフィール" Icon={PermIdentityIcon} />
            <SidebarOption text="ブックマーク" Icon={BookmarkBorderIcon} />
            <SidebarOption text="支払い" Icon={PaymentsIcon} />
            <SidebarOption text="記事" Icon={ArticleIcon} />
            <SidebarOption text="設定" Icon={SettingsIcon} />
            <SidebarOption text="ログアウト" Icon={LogoutIcon} onClick={() => setOpenLogoutDialog(true)} />
          </div>
        </div>
      </Drawer>

      {/* ログアウト確認ダイアログ */}
      <Dialog open={openLogoutDialog} onClose={() => setOpenLogoutDialog(false)}>
        <DialogTitle>ログアウトしますか？</DialogTitle>
        <DialogContent>
          <p>ログアウトすると、現在のセッションが終了します。</p>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenLogoutDialog(false)}>キャンセル</Button>
          <Button onClick={handleLogout} color="primary">ログアウト</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default TweetBox;
