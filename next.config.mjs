// next.config.mjs
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  output: 'export',
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin-allow-popups',
          },
        ],
      },
    ];
  },
  
  // ルートからログインページへのリダイレクト設定を追加
  async redirects() {
    return [
      {
        source: '/',
        destination: '/login', // ルートをログインページにリダイレクト
        permanent: true, // 永続的なリダイレクト
      },
    ];
  },
};

export default nextConfig;
