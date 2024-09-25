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
import VerifiedUser from '@mui/icons-material/VerifiedUser';
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
import { useNavigate, useParams } from 'react-router-dom';
import { Link } from 'react-router-dom';
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
import { useLocation } from 'react-router-dom';

function TweetBox({ origin }) {
  const auth = getAuth();
  const { uid } = useParams(); // URL パラメータから uid を取得
  const currentUser = auth.currentUser;
  const { avatar, setAvatar } = useAvatar();
  const [backgroundURL, setBackgroundURL] = useBackground();
  const [tweetMessage, setTweetMessage] = useState('');
  const [tweetImage, setTweetImage] = useState(null);
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [openDrawer, setOpenDrawer] = useState(false);
  const [openLogoutDialog, setOpenLogoutDialog] = useState(false);
  const [followingCount, setFollowingCount] = useState(0);
  const [followersCount, setFollowersCount] = useState(0);
  const [currentUid, setCurrentUid] = useState('');
  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation(); // 現在のlocationを取得
  const [bio, setBio] = useState('');
  const [profile, setProfile] = useState({
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
        const userDocRef = doc(db, 'users', uid);
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

  const sendTweet = async (e) => {
    e.preventDefault();
  
    try {
      let avatarURL = avatar;
      let displayName = currentUser ? currentUser.displayName : 'Guest User'; // ゲストユーザーの場合のデフォルト名
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
  
  

  const toggleDrawer = (open) => {
    setOpenDrawer(open);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error('ログアウト中にエラーが発生しました:', error);
    }
  };

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    setTweetImage(file);
    event.target.value = null;
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
        {console.log('Current UID:', currentUid, 'Requested UID:', uid)}
        <div
          className={`${
            currentUid === uid || uid.includes('guest') ? '' : 'invisible'
          }`}
        >
          <Link
            to={`/profile/${uid}`}
            state={{ backgroundLocation: location }}
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
                <VerifiedUser className="text-twitter-color mr-1 !text-sm" />@
                {username}
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
                to={`/recommended/${uid}/recommended`}
                className="mr-5 hover:border-b"
              >
                おすすめのユーザー
              </Link>
              <Link
                to={`/following/${uid}/following`}
                className="mr-5 hover:border-b"
              >
                <span className="mr-1 text-white">{followingCount}</span>
                フォロー中
              </Link>
              <Link
                to={`/followers/${uid}/followers`}
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
            onClick={() => fileInputRef.current.click()}
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

      <Drawer
        anchor="left"
        open={openDrawer}
        onClose={() => toggleDrawer(false)}
        className="block sm:hidden"
        PaperProps={{
          style: {
            height: '100vh',
          },
        }}
      >
        <div className="p-4 bg-black text-white border-r-4 border-gray-700 h-full">
          <div>
            <SidebarOption
              text={currentUser ? currentUser.displayName : ''}
              Icon={XIcon}
              onClick={() => {
                toggleDrawer(false); // ドロワーを閉じる
                navigate(`/home/${currentUser.uid}`); // ホームページに移動する
              }}
              customText="text-blue-400 text-2xl"
              customClasses="text-blue-400"
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
              onClick={() => setOpenLogoutDialog(true)}
            />
          </div>
        </div>
      </Drawer>

      <Dialog
        open={openLogoutDialog}
        onClose={() => setOpenLogoutDialog(false)}
      >
        <DialogTitle>ログアウト</DialogTitle>
        <DialogContent>
          <p>本当にログアウトしますか？</p>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenLogoutDialog(false)}>キャンセル</Button>
          <Button onClick={handleLogout}>ログアウト</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default TweetBox;
