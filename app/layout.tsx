// app/layout.tsx
'use client';

import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AvatarProvider } from './contexts/AvatarContext';
import { BackgroundProvider } from './contexts/BackgroundContext'; 
import './globals.css';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {

  const router = useRouter();
  const pathname = usePathname();

  const { setIsAuth, setUser } = useAuth();

  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'isAuth') {
        setIsAuth(event.newValue === 'true');
      } else if (event.key === 'user') {
        if (event.newValue) {
          setUser(JSON.parse(event.newValue));
        } else {
          setUser(null);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [setIsAuth, setUser]);

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
