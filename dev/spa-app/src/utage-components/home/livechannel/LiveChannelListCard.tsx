import type { MeetPerson } from '@/types/MeetPerson';
import LiveAndStandbyUsers from './StandbyUsers';

type MeetPersonExtended = MeetPerson & {
  isLive: boolean;
  isCallWaiting: boolean;
  rank?: number;
  hasLovense: boolean;
};

/**
 * 今すぐ話せる女の子一覧
 * @param {MeetPersonExtended[]} totalRankingMeetPeople ランキング順位毎のユーザー情報
 * @returns {React.ReactNode} 今すぐ話せる女の子一覧
 */
const LiveAndStandbyListCard = ({
  totalRankingMeetPeople,
}: {
  totalRankingMeetPeople: MeetPersonExtended[];
}) => {
  return (
    <div style={{ height: '180px' }}>
      <LiveAndStandbyUsers totalRankingMeetPeople={totalRankingMeetPeople} />
    </div>
  );
};
export default LiveAndStandbyListCard;
