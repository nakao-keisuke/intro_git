import { useEffect, useState } from 'react';

/**
 * iframe内で表示されているかどうかを判定するカスタムフック
 * @returns {boolean} iframe内で表示されている場合true
 */
export function useIsEmbedded(): boolean {
  const [isEmbedded, setIsEmbedded] = useState(false);

  useEffect(() => {
    // iframe内かどうかを判定
    const checkIfEmbedded = () => {
      try {
        return window.self !== window.top;
      } catch (_e) {
        // クロスオリジンの場合はエラーが発生するため、trueを返す
        return true;
      }
    };

    setIsEmbedded(checkIfEmbedded());
  }, []);

  return isEmbedded;
}
