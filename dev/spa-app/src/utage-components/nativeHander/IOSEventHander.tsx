import { useEffect, useState } from 'react';

/**
 * iOSのイベントハンドラー
 * iOSのWebViewからのイベントを受け取る
 */
const IOSEventHandler = () => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(typeof window !== 'undefined');
  }, []);

  if (!isClient) {
    return null; // SSR時は何もレンダリングしない
  }

  window.handleNativeEvent = async (obj: {
    type: string;
    event: string;
    transaction_id: string;
    product: string;
    isProduction: boolean;
  }) => {
    console.log('🌈 Message received from WebView:', obj);

    if (obj.event === 'PULL_TO_REFRESH') {
      // プルダウンした時の処理
      window.location.reload();
      return;
    }
  };

  return null;
};

export default IOSEventHandler;
