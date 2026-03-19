import { Link } from '@tanstack/react-router';
import { useRouter } from 'next/router';
import { memo } from 'react';
import { ClipLoader } from 'react-spinners';
import { useLivePeopleInfoList } from '@/hooks/useLivePeopleInfoList.hook';
import styles from '@/styles/home/livechannel/LiveChannelMeetPeople.module.css';
import type { MeetPerson } from '@/types/MeetPerson';
import StandbyUser from './StandbyUser';

type MeetPersonExtended = MeetPerson & {
  isLive: boolean;
  isCallWaiting: boolean;
  rank?: number;
  hasLovense: boolean;
};

const LiveAndStandbyUsers = memo(
  ({
    totalRankingMeetPeople,
  }: {
    totalRankingMeetPeople: MeetPersonExtended[];
  }) => {
    const { livePeopleInfoList, isLoading } = useLivePeopleInfoList();

    // アクティブな配信をフィルタリング
    const activeUsers = livePeopleInfoList?.filter((user) => {
      const viewerCount = user.channelInfo.userCount;
      const isActive = viewerCount !== null && viewerCount > 1;
      const isWaiting = viewerCount === null;

      return (
        (isActive || isWaiting) &&
        (user.liveCallView.type === 'live' ||
          user.liveCallView.type === 'videoCallFromStandby' ||
          false)
      );
    });

    // 配信中の女の子
    const displayUsers =
      livePeopleInfoList?.filter(
        (item) =>
          item.liveCallView.type === 'live' ||
          item.liveCallView.type === 'videoCallFromStandby' ||
          item.liveCallView.type === 'sideWatch',
      ) ?? [];

    // 配信終了後にユーザーが残っている場合があるためchannelInfo.userCount(自分も含むので-1)が1より大きい、またはnull(待機中)の場合にのみ表示する
    const DisplayItems = displayUsers
      .filter(
        (user) =>
          user.channelInfo.userCount - 1 > 1 ||
          user.channelInfo.userCount === null ||
          user.liveCallView.type === 'live',
      )
      .map(({ meetPerson, liveCallView, channelInfo }) => {
        return (
          <StandbyUser
            meetPerson={meetPerson}
            liveCallView={liveCallView}
            channelInfo={channelInfo}
            rank={
              totalRankingMeetPeople.find(
                (person) => person.userId === meetPerson.userId,
              )?.rank
            }
            key={meetPerson.userId}
          />
        );
      });

    return (
      <div>
        <Title context="配信中の女の子" />
        {isLoading ? (
          <div className={styles.none}>
            <ClipLoader size={24} />
          </div>
        ) : activeUsers && activeUsers.length > 0 ? (
          <div className={styles.liveItemsContainer}>{DisplayItems}</div>
        ) : (
          <div className={styles.containerFixedHeight}>
            <li className={styles.none}>現在配信中のユーザーはいません。</li>
          </div>
        )}
      </div>
    );
  },
);

export default LiveAndStandbyUsers;
LiveAndStandbyUsers.displayName = 'LiveChannelMeetPeople';

/**
 * タイトルヘッダー
 * @param context タイトル
 * @returns
 */
const Title = ({ context }: { context: string }) => {
  const router = useRouter();

  const _handleRefresh = () => {
    router.reload();
  };

  return (
    <div className={styles.content}>
      <h5 className={styles.title}>&nbsp;&nbsp;&nbsp;&nbsp;{context}</h5>
      <div className={styles.right}>
        <Link href="/live-list">
          <div className={styles.all}>すべて見る</div>
        </Link>
      </div>
    </div>
  );
};
