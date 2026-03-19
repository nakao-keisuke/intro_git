/**
 * Media Session APIをクリアする
 * iOSロック画面のメディアコントロールを削除するために使用
 */
export const clearMediaSession = (): void => {
  try {
    if (typeof window !== 'undefined' && 'mediaSession' in navigator) {
      navigator.mediaSession.metadata = null;
      navigator.mediaSession.playbackState = 'none';
    }
  } catch (error) {
    console.warn('Failed to clear media session:', error);
  }
};
