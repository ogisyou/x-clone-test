import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CloseIcon from '@mui/icons-material/Close';
import AddAPhotoIcon from '@mui/icons-material/AddAPhoto';
import { Avatar } from '@mui/material';
import { db, storage } from '../firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { useAvatar } from '../contexts/AvatarContext';
import { useBackground } from '../contexts/BackgroundContext';

function ProfileEdit() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState({
    username: '',
    displayName: '',
    bio: '',
    birthplace: '',
    birthDate: '',
  });
  const { avatar, setAvatar } = useAvatar();
  const [file, setFile] = useState(null);
  const [backgroundFile, setBackgroundFile] = useState(null);
  const [backgroundURL, setBackgroundURL] = useBackground();
  const fileInputRef = useRef(null);
  const backgroundFileInputRef = useRef(null);
  const auth = getAuth();
  const currentUser = auth.currentUser;

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const auth = getAuth();
        const currentUser = auth.currentUser;
        const guestUid = localStorage.getItem('uid');

        console.log(
          'Current UID (guest or auth):',
          currentUser ? currentUser.uid : guestUid
        );

        if (!currentUser) {
          // ゲストユーザーのデータを取得
          console.log('Fetching guest user data...');
          const userDocRef = doc(db, 'users', guestUid);
          const userDoc = await getDoc(userDocRef);

          if (userDoc.exists()) {
            const userData = userDoc.data();
            setProfile({
              username: userData.username || 'Guest_User',
              displayName: userData.displayName || 'Guest_User',
              bio: userData.bio || '',
              birthplace: userData.birthplace || '',
              birthDate: userData.birthDate || '',
            });

            if (userData.avatarURL) {
              setAvatar(userData.avatarURL);
            }

            if (userData.backgroundURL) {
              setBackgroundURL(userData.backgroundURL);
            }
          } else {
            console.log('ゲストユーザーデータが見つかりませんでした');
          }
        } else {
          // ログインユーザーのデータを取得
          console.log('Fetching logged-in user data...');
          const userDocRef = doc(db, 'users', currentUser.uid);
          const userDoc = await getDoc(userDocRef);

          if (userDoc.exists()) {
            const userData = userDoc.data();
            setProfile({
              username: currentUser.displayName || '',
              displayName: userData.displayName || '',
              bio: userData.bio || '',
              birthplace: userData.birthplace || '',
              birthDate: userData.birthDate || '',
            });

            if (userData.avatarURL) {
              setAvatar(userData.avatarURL);
            }

            if (userData.backgroundURL) {
              setBackgroundURL(userData.backgroundURL);
            }
          } else {
            console.log('ユーザーデータが見つかりませんでした');
          }
        }
      } catch (error) {
        console.error(
          'プロフィールデータの取得中にエラーが発生しました:',
          error
        );
      }
    };

    fetchProfileData();
  }, [setAvatar, setBackgroundURL]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((prevProfile) => ({
      ...prevProfile,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const auth = getAuth();
      const currentUser = auth.currentUser;
      const userDocRef = currentUser
        ? doc(db, 'users', currentUser.uid)
        : doc(db, 'users', localStorage.getItem('uid')); // ゲストユーザーのUIDを使用

      let avatarURL = avatar;
      let updatedBackgroundURL = backgroundURL;

      if (file) {
        const storageRef = ref(
          storage,
          `avatars/${currentUser ? currentUser.uid : 'guest'}`
        );
        const uploadTask = uploadBytesResumable(storageRef, file);

        await new Promise((resolve, reject) => {
          uploadTask.on(
            'state_changed',
            null,
            (error) => {
              console.error(
                '画像のアップロード中にエラーが発生しました:',
                error
              );
              reject(error);
            },
            async () => {
              avatarURL = await getDownloadURL(uploadTask.snapshot.ref);
              resolve();
            }
          );
        });
      }

      if (backgroundFile) {
        const backgroundStorageRef = ref(
          storage,
          `backgrounds/${currentUser ? currentUser.uid : 'guest'}`
        );
        const backgroundUploadTask = uploadBytesResumable(
          backgroundStorageRef,
          backgroundFile
        );

        await new Promise((resolve, reject) => {
          backgroundUploadTask.on(
            'state_changed',
            null,
            (error) => {
              console.error(
                '背景画像のアップロード中にエラーが発生しました:',
                error
              );
              reject(error);
            },
            async () => {
              updatedBackgroundURL = await getDownloadURL(
                backgroundUploadTask.snapshot.ref
              );
              resolve();
            }
          );
        });
      }

      await setDoc(
        userDocRef,
        {
          username: profile.username,
          displayName: profile.displayName,
          bio: profile.bio,
          birthplace: profile.birthplace,
          birthDate: profile.birthDate,
          avatarURL: avatarURL,
          backgroundURL: updatedBackgroundURL,
        },
        { merge: true }
      );

      setAvatar(avatarURL);
      setBackgroundURL(updatedBackgroundURL);
      navigate(
        `/home/${currentUser ? currentUser.uid : localStorage.getItem('uid')}`
      );
      // ページを再読み込み
      window.location.reload();
    } catch (error) {
      console.error('プロフィールの保存中にエラーが発生しました:', error);
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setAvatar(URL.createObjectURL(selectedFile));
      setFile(selectedFile);
    }
  };

  const handleBackgroundFileClick = () => {
    backgroundFileInputRef.current.click();
  };

  const handleBackgroundFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setBackgroundFile(selectedFile);
      setBackgroundURL(URL.createObjectURL(selectedFile));
    }
  };

  const resetBackgroundImage = () => {
    setBackgroundURL('');
    setBackgroundFile(null);
  };

  const resetAvatar = () => {
    setAvatar('');
    setFile(null);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div
        className="fixed inset-0 bg-gray-600 bg-opacity-50"
        onClick={() =>
          navigate(
            `/home/${
              currentUser ? currentUser.uid : localStorage.getItem('uid')
            }`
          )
        }
      ></div>

      <div className="relative bg-black px-4 rounded-lg w-[600px] h-[650px] mx-auto shadow-lg z-10 overflow-y-auto">
        <div className="sticky top-0 z-20 flex justify-between items-center p-2 bg-black backdrop-blur-md bg-opacity-70">
          <div className="flex">
            <CloseIcon
              className="cursor-pointer text-white mr-5"
              onClick={() =>
                navigate(
                  `/home/${
                    currentUser ? currentUser.uid : localStorage.getItem('uid')
                  }`
                )
              }
            />
            <h2 className="text-xl font-bold text-white">プロフィールを編集</h2>
          </div>
          <div>
            <button
              onClick={handleSubmit}
              className="bg-white text-black font-bold py-1 px-4 rounded-3xl hover:bg-gray-300"
            >
              保存
            </button>
          </div>
        </div>

        <div
          className="mt-4 mb-8 flex justify-center items-center bg-gray-700 h-48 rounded"
          style={{
            backgroundImage: `url(${backgroundURL})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <div className="flex items-center justify-center w-10 h-10 bg-black rounded-full bg-opacity-50 cursor-pointer hover:bg-opacity-60">
            <AddAPhotoIcon
              className="text-white cursor-pointer"
              onClick={handleBackgroundFileClick}
            />
            <input
              type="file"
              ref={backgroundFileInputRef}
              onChange={handleBackgroundFileChange}
              className="hidden"
              accept="image/*"
            />
          </div>
          <div className="flex items-center justify-center w-10 h-10 bg-black rounded-full bg-opacity-50 cursor-pointer ml-5 hover:bg-opacity-60">
            <CloseIcon
              className="cursor-pointer text-white"
              onClick={resetBackgroundImage}
            />
          </div>
        </div>

        <div>
          <div className="relative w-28 h-28 mb-4">
            <Avatar
              src={avatar}
              className={`w-full h-full ${avatar ? 'bg-white' : ''}`}
            />
            <div
              className="absolute bottom-8 right-9 w-10 h-10 bg-black rounded-full bg-opacity-50 flex items-center justify-center cursor-pointer hover:bg-opacity-60"
              onClick={handleAvatarClick}
            >
              <AddAPhotoIcon className="text-white" />
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept="image/*"
              />
            </div>
          </div>
          <div className="flex items-end">
            <button
              onClick={resetAvatar}
              className="text-white text-sm mb-8 ml-2 hover:text-blue-400"
            >
              アバターリセット
            </button>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative mb-8">
            <input
              type="text"
              name="displayName"
              value={profile.displayName}
              onChange={handleChange}
              maxLength={30}
              className="appearance-none w-full p-2 h-14 border bg-black border-gray-700 rounded pr-16"
              placeholder="名前"
            />
            <div className="absolute right-2 bottom-0 text-xs text-gray-500">
              {profile.displayName.length} / 30
            </div>
          </div>

          <div className="relative">
            <textarea
              name="bio"
              value={profile.bio}
              onChange={handleChange}
              maxLength={160}
              className="appearance-none w-full p-2 h-36 border mb-5 bg-black border-gray-700 rounded pr-16 resize-none"
              placeholder="自己紹介"
            />
            <div className="absolute right-2 bottom-7 text-xs text-gray-500">
              {profile.bio.length} / 160
            </div>
          </div>

          <div className="relative">
            <input
              type="text"
              name="birthplace"
              value={profile.birthplace}
              onChange={handleChange}
              maxLength={30}
              className="appearance-none w-full p-2 h-14 border mb-5 bg-black border-gray-700 rounded pr-16"
              placeholder="出生地"
            />
            <div className="absolute right-2 bottom-5 text-xs text-gray-500">
              {profile.birthplace.length} / 30
            </div>
          </div>

          <div>
            <input
              type="date"
              name="birthDate"
              value={profile.birthDate}
              onChange={handleChange}
              className="appearance-none w-full p-2 h-14 mb-8 border bg-black border-gray-700 rounded"
              placeholder="誕生日"
            />
          </div>
        </form>
      </div>
    </div>
  );
}

export default ProfileEdit;
