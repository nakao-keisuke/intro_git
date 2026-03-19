interface Window {
  handleNativeEvent?: (data: any) => void;
  webkit?: {
    messageHandlers?: {
      nativeHandler?: {
        postMessage: (message: any) => void;
      };
    };
  };
  handleNativeEvent: (data: any) => void;
  ReactNativeWebView?: {
    postMessage: (message: string) => void;
  };
}

/**
 * gtag の型
 */
interface Window {
  gtag?: (...args: any[]) => void;
}

/**
 * インストールボタンをクリックしたときのイベント
 */
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  prompt: () => Promise<void>;
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
}

/**
 * WindowEventMap の拡張
 */
interface WindowEventMap {
  beforeinstallprompt: BeforeInstallPromptEvent;
}
