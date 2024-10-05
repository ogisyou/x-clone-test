// app/layout.tsx
'use client';

import React from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { AvatarProvider } from './contexts/AvatarContext';
import { BackgroundProvider } from './contexts/BackgroundContext';
import AuthWrapper from '@/app/components/AuthWrapper'; 
import './globals.css';

const RootLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <html lang="ja">
      <body>
        <AuthProvider>
          <AvatarProvider>
            <BackgroundProvider>
              <AuthWrapper>{children}</AuthWrapper>
            </BackgroundProvider>
          </AvatarProvider>
        </AuthProvider>
      </body>
    </html>
  );
};

export default RootLayout;