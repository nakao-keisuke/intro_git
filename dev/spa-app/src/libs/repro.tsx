import { useEffect } from 'react';
import { isNativeApplication } from '@/constants/applicationId';
import { useGetMyInfo } from '@/hooks/useGetMyInfo.hook';
import { sendMessageToWebView } from '@/utils/webview';

/**
 * 本番環境でのみReproを読み込む
 * ユーザーの現在の保有ポイント数とユーザー名をReproに送信する
 * @returns {React.ReactElement}
 */
export const ReproTracker = () => {
  const myInfo = useGetMyInfo();

  /**
   * 現在の保有ポイント数をReproに設定
   */
  const setCurrentPoints = (points: number): void => {
    try {
      // Utage内のRepro初期化を停止したため、Web版への直接送信は行わない
      // ネイティブアプリ（Renka）のみpostMessageを送信する
      if (!isNativeApplication()) return;
      sendMessageToWebView({
        type: 'REPRO_SET_USER_PROPERTY',
        payload: { name: 'current_points', value: points },
      });
    } catch (error) {
      console.error('ReproLog: current_pointsの設定に失敗しました:', error);
    }
  };

  /**
   * ユーザー名をReproに設定
   */
  const setUserName = (userName: string): void => {
    try {
      // Utage内のRepro初期化を停止したため、Web版への直接送信は行わない
      // ネイティブアプリ（Renka）のみpostMessageを送信する
      if (!isNativeApplication()) return;
      sendMessageToWebView({
        type: 'REPRO_SET_USER_PROPERTY',
        payload: { name: 'user_name', value: userName },
      });
    } catch (error) {
      console.error('ReproLog: user_nameの設定に失敗しました:', error);
    }
  };

  // ユーザー情報（ポイント・ユーザー名）が更新されたタイミングでReproに送信
  useEffect(() => {
    // Web(Utage)のRepro初期化は無効化。Renka(Native)でのみpostMessageを送る。
    if (!isNativeApplication()) return;
    if (!myInfo.isLoginUser) return;

    const currentPoints = myInfo.data.point ?? 0;
    setCurrentPoints(currentPoints);

    const userName = myInfo.data.userName;
    if (userName) setUserName(userName);
  }, [myInfo]);

  return <></>;
};
