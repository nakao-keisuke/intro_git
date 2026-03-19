const callPic = '/chat/call.webp';
const moviePic = '/chat/image.webp';
const livePic = '/situation.icon/live.webp';
const cameraPic = '/chat/camera.webp';
const twoshotPic = '/situation.icon/video.webp';

// 投稿ボタンの設定
export const postButtons = [
  {
    postMessage: 'ビデオ通話しましょう!!',
    postCompleteMessage: '投稿が完了しました！',
    subMessage: 'プロフィールに好みのタイプを記載しておこう♪',
    icon: twoshotPic,
    iconSize: { width: 17, height: 17 },
    text: 'ビデオ通話しましょう！',
    updateCallSetting: true,
  },
  {
    postMessage: '音声通話しましょう!!',
    postCompleteMessage: '投稿が完了しました！',
    subMessage: 'プロフィールに好みのタイプを記載しておこう♪',
    icon: callPic,
    iconSize: { width: 17, height: 17 },
    text: '音声通話しましょう！',
    updateCallSetting: true,
  },
  {
    postMessage: 'いきなりかけてもらって大丈夫です☆',
    postCompleteMessage: '投稿が完了しました！',
    subMessage: 'プロフィールに好みのタイプを記載しておこう♪',
    icon: callPic,
    iconSize: { width: 17, height: 17 },
    text: 'いきなりかけてもらって大丈夫です☆',
    updateCallSetting: true,
  },
  {
    postMessage: '通話リクエストをくれたらかけます♪',
    postCompleteMessage: '投稿が完了しました！',
    subMessage: 'プロフィールに好みのタイプを記載しておこう♪',
    icon: callPic,
    iconSize: { width: 17, height: 17 },
    text: '通話リクエストをくれたらかけます♪',
    updateCallSetting: false,
  },
  {
    postMessage: 'チャットでお話ししましょう！',
    postCompleteMessage: '投稿が完了しました！',
    subMessage: 'プロフィールに好みのタイプを記載しておこう♪',
    icon: livePic,
    iconSize: { width: 20, height: 20 },
    text: 'チャットでお話ししましょう！',
    updateCallSetting: true,
  },
  {
    postMessage: '動画送って欲しいです^^',
    postCompleteMessage: '投稿が完了しました！',
    subMessage: 'プロフィールに好みのタイプを記載しておこう♪',
    icon: moviePic,
    iconSize: { width: 17, height: 17 },
    text: '動画送って欲しいです^^',
    updateCallSetting: false,
  },
  {
    postMessage: '画像送って欲しいです^^',
    postCompleteMessage: '投稿が完了しました！',
    subMessage: 'プロフィールに好みのタイプを記載しておこう♪',
    icon: cameraPic,
    iconSize: { width: 18, height: 18 },
    text: '画像送って欲しいです^^',
    updateCallSetting: false,
  },
];

export type PostButton = (typeof postButtons)[number];
