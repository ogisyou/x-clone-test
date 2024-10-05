// app/components/AuthWrapper.tsx
'use client';

import React, { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

const AuthWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
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

  return <>{children}</>;
};

export default AuthWrapper;