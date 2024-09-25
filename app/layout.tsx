// app/layout.tsx
import { Metadata } from 'next';
import localFont from 'next/font/local';
import './globals.css';
import Home from './pages/home/[uid]';
import { useAuth, AuthProvider } from '@/app/contexts/AuthContext'; // このパスが正しいか

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
}: {
  children: React.ReactNode; // childrenを使用するために型定義を追加
}) {
  const auth = useAuth(); // ここで useAuth を呼び出す
  return (
    <AuthProvider>
      <html lang="ja">
        <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
          <Home isGuest={auth.isAuthenticated} /> {/* auth を使用 */}
          {/* {children} */}
        </body>
      </html>
    </AuthProvider>
  );
}
å