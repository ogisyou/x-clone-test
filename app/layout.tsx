// app/layout.tsx
import { Metadata } from 'next';
import localFont from 'next/font/local';
import './globals.css';
import Home from './pages/home/[uid]';
import { useAuth, AuthProvider } from '@/app/contexts/AuthContext'; // AuthProvider をインポート

const geistSans = localFont({
  src: './fonts/GeistVF.woff',
  variable: '--font-geist-sans',
  weight: '100 900',
});
const geistMono = localFont({
  src: './fonts/GeistMonoVF.woff',
  variable: '--font-geist-mono',
  weight: '100 900',
});

export const metadata: Metadata = {
  title: 'Next14js X-clone',
  description: 'Next14js X-clone',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AuthProvider> {/* AuthProvider でラップ */}
      <html lang="ja">
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          <Home isGuest={useAuth().isAuthenticated} /> {/* isGuest を渡す */}
          {/* {children} */}
        </body>
      </html>
    </AuthProvider>
  );
}
