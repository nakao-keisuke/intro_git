declare global {
  interface Window {
    ttq?: {
      load: (pixelId: string) => void;
      page: () => void;
      track: (eventName: string, parameters?: Record<string, any>) => void;
      identify: (userData: {
        email?: string;
        phone_number?: string;
        external_id?: string;
      }) => void;
      // その他のTikTok Pixel メソッド
      instances?: any;
      debug?: () => void;
      on?: (event: string, callback: () => void) => void;
      off?: (event: string, callback: () => void) => void;
      once?: (event: string, callback: () => void) => void;
      ready?: (callback: () => void) => void;
      alias?: (aliasId: string) => void;
      group?: (groupId: string) => void;
      enableCookie?: () => void;
      disableCookie?: () => void;
      holdConsent?: () => void;
      revokeConsent?: () => void;
      grantConsent?: () => void;
    };
  }
}

export {};
