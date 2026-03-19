import { useEffect, useMemo } from 'react';
import { usePointStore } from '@/stores/pointStore';

/**
 * マイページでのポイント表示を管理するカスタムフック
 * Zustandの値を優先し、初期値(0)の場合はSSRの値を使用する
 * API呼び出しは行わない（Zustandは各ポイント変動時に更新されている前提）
 *
 * @param ssrPoint - SSRで取得した初期ポイント値
 * @returns displayPoint - 表示用ポイント値
 * @returns formattedPoint - フォーマット済みポイント文字列（カンマ区切り）
 */
export const useMyPagePoint = (ssrPoint: number) => {
  const currentPoint = usePointStore((s) => s.currentPoint);
  const initializeFromSSR = usePointStore((s) => s.initializeFromSSR);

  // Zustandが初期値(0)でSSRに値がある場合は、SSRの値でZustandを初期化
  useEffect(() => {
    if (currentPoint === 0 && ssrPoint > 0) {
      initializeFromSSR(ssrPoint);
    }
  }, [currentPoint, ssrPoint, initializeFromSSR]);

  // 表示するポイント: Zustandが0ならSSRの値、それ以外はZustandの値
  const displayPoint = currentPoint > 0 ? currentPoint : ssrPoint;

  // ポイント表示の最適化（カンマ区切りフォーマット）
  const formattedPoint = useMemo(
    () => displayPoint.toLocaleString('ja-JP'),
    [displayPoint],
  );

  return {
    displayPoint,
    formattedPoint,
  };
};
