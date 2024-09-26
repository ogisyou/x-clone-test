import React, { Suspense, lazy } from 'react';
import Search from '@mui/icons-material/Search';

// Twitter Embed の lazy import
const TwitterTweetEmbed = lazy(() =>
  import('react-twitter-embed').then((module) => ({
    default: module.TwitterTweetEmbed,
  }))
);
const TwitterTimelineEmbed = lazy(() =>
  import('react-twitter-embed').then((module) => ({
    default: module.TwitterTimelineEmbed,
  }))
);
const TwitterShareButton = lazy(() =>
  import('react-twitter-embed').then((module) => ({
    default: module.TwitterShareButton,
  }))
);

// Propsのインターフェースを修正
interface WidgetsProps {
  uid: string; // uid をプロパティとして受け取る
  className: string; 
}

function Widgets({ uid, className }: WidgetsProps) {
  return (
    <div className={`hidden lg:block lg:flex-[0.35] border-l border-gray-700 ${className}`}>
      <div className="flex items-center bg-twitter-background p-2 rounded-2xl mt-2 ml-5">
        <Search className="text-gray-500" />
        <input
          className="border-none bg-twitter-background w-full outline-none caret-white text-white text-lg"
          placeholder="キーワード検索"
          type="text"
        />
      </div>

      <div className="mt-2 ml-5 p-5 pt-1 bg-black rounded-2xl">
        <h2 className="text-lg font-extrabold">いまどうしてる？</h2>
        <div style={{ marginBottom: '5px', height: '400px', overflow: 'auto' }}>
          <Suspense fallback={<div>Loading...</div>}>
            <TwitterTweetEmbed tweetId={'1824252296852804056'} />
          </Suspense>
        </div>
        <Suspense fallback={<div>Loading...</div>}>
          <TwitterTimelineEmbed
            sourceType="profile"
            screenName="tenkijp"
            options={{ height: 400 }}
          />
          <TwitterShareButton
            url={'https://x.com/tenkijp'}
            options={{ text: '#Sample', via: 'tenkijp' }}
          />
        </Suspense>
      </div>
    </div>
  );
}

export default Widgets;
