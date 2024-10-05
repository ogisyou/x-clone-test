import Link from 'next/link';

export default function NotFound() {
  return (
    <div>
      <h2>ページが見つかりません</h2>
      <p>申し訳ありませんが、お探しのページは存在しません。</p>
      <Link href="/">
        ホームに戻る
      </Link>
    </div>
  );
}