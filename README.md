# X-clone

## 概要

X-clone は、リアルタイムの短文投稿ができる SNS プラットフォームです。
世界中の出来事や個人の意見に対して、短文投稿や他者フォローを行い、情報を共有することができます。
レスポンシブ対応しているため、スマホからも確認可能です。

※プログラミング学習の成果として、「X（旧 Twitter）」のクローンサイトを作成しました。

開発期間：約 2 ヶ月

 <img width="1400" alt="スクリーンショット 2024-10-06" src="https://github.com/user-attachments/assets/d296651c-5c25-48ef-9c01-317b3a57d875">
 <img width="350" height="700" src= "https://github.com/user-attachments/assets/5cc394ed-b997-4896-ac6f-b0487b7070e7">
 

[URL](https://x-clone-test-5puz3vqwj-ogisyous-projects.vercel.app/login)

画面右側の「ゲストログインボタン」から、メールアドレスを入力せずにログインできます。

## 使用技術

### フロントエンド
- React 18.2.0
- Next.js 14.2.15
- TypeScript 5.6.2

### スタイリング
- Material-UI (@mui/material 5.15.6, @emotion/react 11.11.3, @emotion/styled 11.11.3)
- Tailwind CSS 3.4.1

### バックエンド / インフラストラクチャ
- Firebase 10.7.2
  - Firestore Database
  - Authentication
  - Storage
  - Cloud Functions 4.6.0
- Firebase Admin SDK 12.0.0
- Node.js 20

### デプロイメント / ホスティング
- Vercel (Next.js hosting)
  - デプロイ方法: vercelコマンド入力
- Firebase (Cloud Functions, Firestore Database)
  - デプロイ方法: `firebase deploy --only functions` コマンド入力

### ユーティリティとツール
- react-flip-move 3.0.5
- react-twitter-embed 4.0.4
- react-router-dom 6.21.3
- Express 4.21.1
- dotenv 16.4.5

### 状態管理とロジック
- Context API (React built-in)
- Custom Hooks

### 開発ツールとプラクティス
- ESLint 8.56.0

## 機能一覧

1. アカウント管理
   - アカウント作成（メールアドレスとパスワード）
   - Google アカウントでの登録・ログイン
   - ゲストユーザーとしてのログイン
   - ログアウト

2. プロフィール管理
   - プロフィール情報の表示
   - プロフィール情報の編集（表示名、自己紹介、出身地、誕生日）
   - プロフィール画像の設定・変更
   - プロフィール背景画像の設定・変更

3. 投稿機能
   - テキスト投稿の作成
   - 画像付き投稿の作成
   - 自分の投稿の削除
   - 投稿への返信機能
   - 投稿へのいいね機能

4. タイムライン
   - ホームタイムラインの表示（自分とフォロー中のユーザーの投稿）

5. ユーザー間交流
   - 他のユーザーのフォロー/フォロー解除
   - フォロー中のユーザー一覧表示
   - フォロワー一覧表示
   - おすすめユーザーの表示

6. 検索機能
   - ユーザー検索機能（ユーザー名での検索）

7. UI/UX
   - レスポンシブデザイン（スマートフォン、タブレット、デスクトップ対応）