import { useMemo, useRef } from 'react';
import { useLiveUsers } from '@/hooks/usePollingData';
import type { LiveChannelInfo, LiveChannels } from '@/services/shared/type';
import { isSameLiveChannelInfo } from '@/utils/liveUserComparison';

/**
 * ポーリングで取得したライブユーザー一覧を参照安定化して返す。
 * データ内容が前回と同じ場合は同一参照を返し、子の再レンダリングを抑制する。
 */
export const useStableLiveUsers = (): LiveChannelInfo[] => {
  const { data: liveUsersPollingData } = useLiveUsers();
  const prevRef = useRef<LiveChannelInfo[]>([]);

  return useMemo(() => {
    if (!liveUsersPollingData?.data) {
      return prevRef.current.length === 0 ? [] : prevRef.current;
    }
    const pollingData = liveUsersPollingData.data as LiveChannels;
    const newList = [
      ...(pollingData.inLiveList || []),
      ...(pollingData.standbyList || []),
    ];

    const prev = prevRef.current;
    if (
      prev.length === newList.length &&
      prev.every((item, i) => {
        const next = newList[i];
        return next != null && isSameLiveChannelInfo(item, next);
      })
    ) {
      return prev;
    }

    prevRef.current = newList;
    return newList;
  }, [liveUsersPollingData?.data]);
};
