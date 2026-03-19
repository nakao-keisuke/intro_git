// 日付変更を検知するカスタムフック

import { useEffect } from 'react';
import { useLovenseStore } from '@/features/lovense/store/lovenseStore';

export const useDateChangeDetector = () => {
  const storeCheckDateChange = useLovenseStore((s) => s.checkDateChange);

  useEffect(() => {
    // 現在の日付を取得
    let currentDate = new Date().toISOString().split('T')[0];

    // 日付変更をチェックする関数
    const checkDateChange = () => {
      const today = new Date().toISOString().split('T')[0];

      if (today !== currentDate) {
        // 日付が変わった
        currentDate = today;

        // lovenseStateを更新（isPlayedTodayをリセット）
        // Zustand storeのcheckDateChange()がisPlayedTodayのリセットを行う
        storeCheckDateChange();
      }
    };

    // 1分ごとにチェック
    const intervalId = setInterval(checkDateChange, 60000);

    // クリーンアップ
    return () => clearInterval(intervalId);
  }, [storeCheckDateChange]);
};
