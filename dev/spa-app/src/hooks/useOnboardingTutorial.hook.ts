import { useSession } from '#/hooks/useSession';
import { useEffect, useState } from 'react';
import type { UseTutorialReturn } from '@/types/onboardingTutorial';

export const useOnboardingTutorial = (): UseTutorialReturn => {
  const { data: session } = useSession();

  // 初期状態では非表示（セッション情報が確定するまで）
  const [showTutorial, setShowTutorial] = useState(false);

  useEffect(() => {
    // SSR（サーバーサイドレンダリング）対応
    if (typeof window === 'undefined') return;

    // ユーザーIDが利用可能になったタイミングでチュートリアル表示判定
    const userId = session?.user?.id;
    if (!userId) {
      setShowTutorial(false);
      return;
    }

    // 一時的にオンボーディングチュートリアルの自動表示を無効化
    // TODO: 将来的に再有効化する場合は、以下のコメントアウトされたロジックを使用
    // const tutorialKey = `tutorial_completed_${userId}`;
    // const tutorialCompleted = localStorage.getItem(tutorialKey);
    // setShowTutorial(!tutorialCompleted);

    // 現在は常に非表示に設定
    setShowTutorial(false);
  }, [session?.user?.id]);

  const completeTutorial = () => {
    const userId = session?.user?.id;
    if (!userId) return;

    // ユーザーIDを含むキーでチュートリアル完了フラグをローカルストレージに保存
    const tutorialKey = `tutorial_completed_${userId}`;
    localStorage.setItem(tutorialKey, 'true');
    setShowTutorial(false);
  };

  const closeTutorial = () => {
    setShowTutorial(false);
  };

  return {
    showTutorial,
    completeTutorial,
    closeTutorial,
  };
};
