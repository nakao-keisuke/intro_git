export function getLiveMessageByTalkTheme(themeText: string): string {
  switch (themeText) {
    case 'どんなお話でもOK':
      return '際どいことも話せます。';
    case '普通のお話しましょ':
      return 'みんなと他愛もない話をしたいです。';
    case '未設定':
      return '色々話したいです。';
    default:
      return '色々話したいです。';
  }
}
