// app/layout.tsx
'use client';

import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AvatarProvider } from './contexts/AvatarContext';
import { BackgroundProvider } from './contexts/BackgroundContext'; 

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuth, setIsAuth, setUid } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const storedIsAuth = localStorage.getItem('isAuth') === 'true';
    const storedUid = localStorage.getItem('uid');
    
    // クライアントサイドでのみ状態を更新
    setIsAuth(storedIsAuth);
    setUid(storedUid);
  }, [setIsAuth, setUid]);

  useEffect(() => {
    if (!isAuth && pathname !== '/login') {
      router.push('/login');
    }
  }, [isAuth, pathname, router]);

  return (
    <html lang="ja">
      <body>
        {children}
      </body>
    </html>
  );
};

const App = ({ children }: { children: React.ReactNode }) => (
  <AuthProvider>
    <AvatarProvider>
      <BackgroundProvider> 
        <Layout>{children}</Layout>
      </BackgroundProvider>
    </AvatarProvider>
  </AuthProvider>
);

export default App;
