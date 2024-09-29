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
import { useParams, useRouter } from 'next/navigation';
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
  const { uid } = useParams(); // useParams() で URL パラメータから uid 
  const currentUser = auth.currentUser;
  const { avatar, setAvatar } = useAvatar();
  const { backgroundURLs } = useBackground();
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
      if (!db) {
        console.error('Firestore (db) が初期化されていません');
        return;
      }
      try {
        const userDocRef = doc(db, 'users', uid as string);
        const docSnap = await getDoc(userDocRef);

        if (docSnap.exists()) {
          const userData = docSnap.data();
          setDisplayName(userData.displayName || '');
          setUsername(userData.username || '');
          setAvatar(userData.avatarURL || '');
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
  }, [uid, setAvatar, currentUser]);

  const sendTweet = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!db||!storage) {
      console.error('Firestore (db) が初期化されていません');
      return;
    }
    try {
      let avatarURL = avatar;
      let displayName = currentUser
        ? currentUser.displayName
        : 'ゲストユーザー'; // ゲストユーザーの場合のデフォルト
      const userUid = currentUser ? currentUser.uid : `guest_${uid}`; // ゲストユーザーには一意のUIDを設定

      // ゲストユーザーの場合の処理
      if (!currentUser) {
        avatarURL = avatar || ''; // デフォルトのアバターまたは空の文字列
        console.log('ユーザーが認証されていません');
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
      // ユーザーがログアウトした後にリスナーを解除

      localStorage.removeItem('isAuth');
      localStorage.removeItem('uid');
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };
  
  

  const handleOpenDialog = () => {
    setOpenLogoutDialog(true);
  };



  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files ? event.target.files[0] : null;
    setTweetImage(file);
    event.target.value = '';
  };

  /* デバッグログを追加 */
  // console.log('Current UID:', currentUid, 'URL取得 UID:', uid);

  return (
    <div className="relative px-4 py-2 border-b-8 border-gray-700">
      <div
        className="w-full h-52 bg-gray-800"
        style={{
          backgroundImage: `url(${backgroundURLs[0] || ''})`, // 最初の背景URLを使用
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      ></div>

      <Avatar
        className={`!absolute top-36 !w-32 !h-32 mt-1 border-4 border-black cursor-pointer xl:cursor-default ${
          avatar ? 'bg-white' : ''
        }`}
        src={avatar}
        onClick={() => toggleDrawer(true)}
      />
      <div className="text-end mt-4">
        <div className={`${currentUid === uid ? '' : 'invisible'}`}>
          <Link
            href={{
              pathname: `/profile/${uid}`,
              query: { background: JSON.stringify(location) }, // クエリパラメータとして location を渡す
            }}
            className="text-white p-2 rounded-3xl border hover:bg-gray-700 bg-black font-bold"
          >
            プロフィールを編集
          </Link>
        </div>
      </div>

      <form onSubmit={sendTweet} className="w-full">
        <div className="items-center mb-2">
          <div className="text-sm p-1 mt-10">
            <h3 className="font-bold text-xl">{displayName}</h3>
            <div className="items-center text-gray-400 mb-2">
              <div>
                <VerifiedUserIcon className="text-twitter-color mr-1 !text-sm" />
                @{username}
              </div>
            </div>

            <div className="tweetBox">
              <p className="text-justify">{bio}</p>
              <div className="flex my-2">
                <div className="flex text-gray-400">
                  <PlaceIcon className="text-xl sm:text-lg" />
                  {profile.birthplace}
                </div>
                <div className="flex ml-5 text-gray-400">
                  <CakeIcon className="text-xl mr-1 sm:text-lg" />
                  {profile.birthDate}
                </div>
              </div>
            </div>

            <div className="flex text-gray-400 mt-3">
              <Link
                href={`/recommended/${uid}/recommended`}
                className="mr-5 hover:border-b"
              >
                おすすめのユーザー
              </Link>
              <Link
                href={`/following/${uid}/following`}
                className="mr-5 hover:border-b"
              >
                <span className="mr-1 text-white">{followingCount}</span>
                フォロー中
              </Link>
              <Link
                href={`/followers/${uid}/followers`}
                className="mr-5 hover:border-b"
              >
                <span className="mr-1 text-white">{followersCount}</span>
                フォロワー
              </Link>
            </div>
          </div>
        </div>

        <div className="border-b border-gray-700 pb-1">
          <input
            value={tweetMessage}
            placeholder="いまどうしている？"
            type="text"
            maxLength={160}
            onChange={(e) => setTweetMessage(e.target.value)}
            className="w-full bg-black text-lg border-none outline-none"
          />
        </div>

        <div className="flex justify-between items-center p-1 my-2">
          <div className="flex-1 flex items-center">
            {tweetImage && <p className="text-white">{tweetImage.name}</p>}
          </div>
          <Button
            variant="outlined"
            className="custom-button !bg-black !p-1 !text-xs sm:!text-sm"
            onClick={() => fileInputRef.current?.click()}
          >
            画像の選択
          </Button>
          <input
            type="file"
            ref={fileInputRef}
            hidden
            onChange={handleImageChange}
          />
        </div>
        <div className="flex justify-between items-center border-t border-gray-700">
          <div className="sm:space-x-1 text-blue-400">
            <InsertPhotoIcon className="text-xl sm:text-2xl" />
            <GifBoxIcon className="text-xl sm:text-2xl" />
            <BallotIcon className="text-xl sm:text-2xl" />
            <SentimentSatisfiedAltIcon className="text-xl sm:text-2xl" />
            <EventNoteIcon className="text-xl sm:text-2xl" />
            <PlaceIcon className="text-xl sm:text-2xl" />
          </div>

          <Button
            variant="contained"
            color="primary"
            type="submit"
            className="custom-button !bg-blue-400 !text-xs mt-1 sm:!text-sm sm:!mt-2 sm:!w-32 sm:!px-7"
          >
            ポストする
          </Button>
        </div>
      </form>

      {/* ドロワー */}
      <Drawer
        anchor="left"
        className="block sm:hidden"
        open={openDrawer}
        onClose={() => toggleDrawer(false)}
        PaperProps={{
          style: {
            height: '100vh',
          },
        }}
      >
        <div className="w-60 h-full p-4 bg-black text-white border-r-4 border-gray-700">
          <div className="flex flex-col mt-1">
            <SidebarOption
              text={currentUser?.displayName || 'Gest_User'} 
              Icon={XIcon}
              onClick={() => {
                toggleDrawer(false); // ドロワーを閉じる
                router.push(`/home/${currentUser?.uid || 'guest'}`);
              }}
              
              customClasses="text-blue-400 text-xl"
            />
            <SidebarOption text="プロフィール" Icon={PermIdentityIcon} />
            <SidebarOption text="プレミアム" Icon={XIcon} />
            <SidebarOption text="リスト" Icon={ArticleIcon} />
            <SidebarOption text="ブックマーク" Icon={BookmarkBorderIcon} />
            <SidebarOption text="認証済み組織" Icon={VerifiedUserIcon} />
            <SidebarOption text="収益化" Icon={PaymentsIcon} />
            <SidebarOption text="広告" Icon={OpenInNewIcon} />
            <SidebarOption text="求人" Icon={CardTravelIcon} />
            <SidebarOption text="設定とプライバシー" Icon={SettingsIcon} />
            <SidebarOption
              text="ログアウト"
              Icon={LogoutIcon}
              onClick={handleOpenDialog}
            />
          </div>
        </div>
      </Drawer>

      {/* ログアウト確認ダイアログ */}
      <Dialog
        open={openLogoutDialog}
        onClose={() => setOpenLogoutDialog(false)}
      >
        <DialogTitle>ログアウト</DialogTitle>
        <DialogContent>
          <p>ログアウトしますか？</p>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleLogout} color="primary">
            はい
          </Button>
          <Button onClick={() => setOpenLogoutDialog(false)}>いいえ</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default TweetBox;
