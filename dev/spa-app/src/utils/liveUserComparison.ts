import type {
  Broadcaster,
  ChannelInfo,
  LiveChannelInfo,
} from '@/services/shared/type';

/** UI表示に影響する Broadcaster フィールドのみを比較。すべて一致で true（再レンダリング不要）、1つでも異なれば false（再レンダリング） */
export const isSameBroadcaster = (
  prev: Broadcaster,
  next: Broadcaster,
): boolean =>
  prev.userId === next.userId &&
  prev.userName === next.userName &&
  prev.age === next.age &&
  prev.avaId === next.avaId &&
  prev.lastLoginTime === next.lastLoginTime &&
  prev.abt === next.abt &&
  prev.bustSize === next.bustSize &&
  prev.hLevel === next.hLevel &&
  prev.region === next.region &&
  prev.isLiveNow === next.isLiveNow &&
  prev.isBookMarked === next.isBookMarked &&
  prev.hasLovense === next.hasLovense &&
  prev.isNewUser === next.isNewUser &&
  (prev.isListedOnFleaMarket ?? false) === (next.isListedOnFleaMarket ?? false);

/** UI表示に影響する ChannelInfo フィールドのみを比較 */
export const isSameChannelInfo = (
  prev: ChannelInfo,
  next: ChannelInfo,
): boolean =>
  prev.thumbnailImageId === next.thumbnailImageId &&
  prev.recordingId === next.recordingId &&
  prev.userCount === next.userCount;

/** LiveChannelInfo 全体の比較 */
export const isSameLiveChannelInfo = (
  prev: LiveChannelInfo,
  next: LiveChannelInfo,
): boolean =>
  isSameBroadcaster(prev.broadcaster, next.broadcaster) &&
  isSameChannelInfo(prev.channelInfo, next.channelInfo);
