import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import type { AppProps } from 'next/app';
import '../styles/globals.css';

type CustomAppProps = AppProps & {
  Component: AppProps['Component'] & {
    auth?: boolean;
  };
};

function MyApp({ Component, pageProps }: CustomAppProps) {
  const [isAuth, setIsAuth] = useState(false);
  const [uid, setUid] = useState<string | null>(null);
  
  const router = useRouter();

  useEffect(() => {
    const storedIsAuth = localStorage.getItem('isAuth') === 'true';
    const storedUid = localStorage.getItem('uid');
    
    console.log('初期保存 isAuth:', storedIsAuth); // Debug: localStorageから取得したisAuthの初期値
    console.log('初期保存 uid:', storedUid);       // Debug: localStorageから取得したuidの初期値
    
    setIsAuth(storedIsAuth);
    setUid(storedUid);
  }, []);

  useEffect(() => {
    if (!isAuth && Component.auth && router.pathname !== '/login') {
      router.push('/login');
    }
  }, [isAuth, router, Component.auth]);

  const customPageProps = {
    ...pageProps,
    isAuth,
    setIsAuth: (value: boolean) => {
      console.log('setIsAuth で呼び出される:', value); // Debug: setIsAuthが呼ばれた際の値
      setIsAuth(value);
      localStorage.setItem('isAuth', value.toString());
    },
    uid,
    setUid: (value: string | null) => {
      console.log('setUid で呼び出される:', value);   // Debug: setUidが呼ばれた際の値
      setUid(value);
      if (value) {
        localStorage.setItem('uid', value);
      } else {
        localStorage.removeItem('uid');
      }
    },
  };

  return <Component {...customPageProps} />;
}

export default MyApp;
