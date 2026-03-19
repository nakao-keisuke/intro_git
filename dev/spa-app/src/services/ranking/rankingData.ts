import { bannedUserIdList } from '@/constants/bannedUserIdList';
import { region } from '@/utils/region';
import {
  CALL_STATUS,
  type RankedMeetPerson,
  type RawRankingUser,
} from './type';

export function processRankingData(
  data: RawRankingUser[],
  isCallWaiting: (userId: string) => boolean,
): RankedMeetPerson[] {
  if (!data) return [];

  return (
    data
      .filter((e) => !bannedUserIdList.includes(e.userId || e.user_id || ''))
      .map((e, index) => {
        const user = 'user' in e ? e.user : e;
        const userId = e.userId || e.user_id;
        const hasLovense = 'hasLovense' in e ? e.hasLovense : e.has_lovense;
        const safeUserId = userId || '';
        const safeUser = user || {};
        const bustSize =
          e.bustSize || e.bust_size || safeUser.bustSize || safeUser.bust_size;
        return {
          userId: safeUserId,
          userName: safeUser.user_name || safeUser.userName || '',
          avatarId:
            safeUser.ava_id || safeUser.avatarId || safeUser.avaId || '',
          gender: safeUser.gender || 0,
          lastLoginTime:
            safeUser.last_login_time || safeUser.lastLoginTime || '',
          about: safeUser.abt || safeUser.about || '',
          onlineStatusLabel:
            safeUser.online_status_label || safeUser.onlineStatusLabel || '',
          onlineStatusColor:
            safeUser.online_status_color || safeUser.onlineStatusColor || '',
          lastActionStatusLabel:
            safeUser.last_action_status_label ||
            safeUser.lastActionStatusLabel ||
            '',
          lastActionStatusColor:
            safeUser.last_action_status_color ||
            safeUser.lastActionStatusColor ||
            '',
          lank: safeUser.lank || 0,
          age: safeUser.age || 0,
          voiceCallWaiting: isCallWaiting(safeUserId)
            ? false
            : safeUser.voice_call_waiting || safeUser.voiceCallWaiting || false,
          videoCallWaiting: isCallWaiting(safeUserId)
            ? false
            : safeUser.video_call_waiting || safeUser.videoCallWaiting || false,
          isNew: safeUser.is_new || safeUser.isNew || false,
          region: region(safeUser.region ?? 0),
          rank: index + 1,
          hasLovense: hasLovense || false,
          channelId:
            safeUser.channel_info?.channel_id ||
            safeUser.channelInfo?.channelId,
          hasChannel: !!(
            safeUser.channel_info?.channel_id || safeUser.channelInfo?.channelId
          ),
          channelOwnerJamboUserId:
            safeUser.channel_info?.channel_owner_jambo_user_id ||
            safeUser.channelInfo?.channelOwnerJamboUserId,
          channelViewers:
            safeUser.channel_info?.channel_viewers ||
            safeUser.channelInfo?.channelViewers ||
            0,
          callStatus:
            safeUser.call_status || safeUser.callStatus || CALL_STATUS.NO_CALL,
          bustSize: bustSize || undefined,
          averageScore:
            e.average_score ??
            e.averageScore ??
            safeUser.average_score ??
            safeUser.averageScore ??
            null,
          reviewCount:
            e.review_count ??
            e.reviewCount ??
            safeUser.review_count ??
            safeUser.reviewCount ??
            0,
        };
      }) || []
  );
}
