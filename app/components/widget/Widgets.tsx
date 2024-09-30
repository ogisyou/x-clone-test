import React from 'react';
import Search from '@mui/icons-material/Search';
import dynamic from 'next/dynamic';

const TwitterTweetEmbed = dynamic(
  () => import('react-twitter-embed').then((mod) => mod.TwitterTweetEmbed),
  { ssr: false }
);

const TwitterTimelineEmbed = dynamic(
  () => import('react-twitter-embed').then((mod) => mod.TwitterTimelineEmbed),
  { ssr: false }
);

const TwitterShareButton = dynamic(
  () => import('react-twitter-embed').then((mod) => mod.TwitterShareButton),
  { ssr: false }
);

interface WidgetsProps {
  className: string;
}

const Widgets: React.FC<WidgetsProps> = ({ className }) => {
  return (
    <div className={className}>
      <div className="flex items-center space-x-2 bg-gray-100 p-3 rounded-full mt-2 mb-4">
        <Search className="text-gray-400" />
        <input
          type="text"
          placeholder="キーワード検索"
          className="flex-1 outline-none bg-transparent"
        />
      </div>

      <React.Suspense fallback={<div>Loading tweet...</div>}>
        <TwitterTweetEmbed tweetId={'1824252296852804056'} />
      </React.Suspense>

      <React.Suspense fallback={<div>Loading timeline...</div>}>
        <TwitterTimelineEmbed
          sourceType="profile"
          screenName="elonmusk"
          options={{ height: 400 }}
        />
      </React.Suspense>

      <React.Suspense fallback={<div>Loading share button...</div>}>
        <TwitterShareButton url={'https://twitter.com'} options={{ text: 'Hello World!' }} />
      </React.Suspense>
    </div>
  );
};

export default Widgets;