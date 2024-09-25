// app/pages/_app.tsx
import { AppProps } from 'next/app'; // AppProps をインポート
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Sidebar from '../components/sidebar/Sidebar'; // Sidebar のパスを確認
import '../globals.css';

const MyApp = ({ Component, pageProps }: AppProps) => { // AppProps 型を指定
  const [isAuth, setIsAuth] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const auth = localStorage.getItem('isAuth') === 'true';
    setIsAuth(auth);
    if (!auth) {
      router.push('/login'); // 未認証の場合はログインページへリダイレクト
    }
  }, [router]);

  return (
    <div className="app">
      {isAuth && <Sidebar username="ユーザー名" />} {/* Sidebar をレンダリング */}
      <Component {...pageProps} />
    </div>
  );
};

export default MyApp;
