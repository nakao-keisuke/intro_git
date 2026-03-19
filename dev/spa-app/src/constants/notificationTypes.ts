export enum NotificationType {
  ALL = 'all',
  FOOTPRINT = 'footprint',
  LIKE = 'like',
}

// 実際の通知タイプの数値定数
export const NOTIFICATION_TYPE_VALUES = {
  FOOTPRINT_OLD: 1,
  FOOTPRINT_NEW: 2,
  LIKE_OLD: 3,
  LIKE_NEW: 4,
  SYSTEM: 17,
} as const;

// ユーザー詳細情報を表示すべき通知タイプ
export const USER_DETAIL_NOTIFICATION_TYPES = [
  NOTIFICATION_TYPE_VALUES.FOOTPRINT_OLD,
  NOTIFICATION_TYPE_VALUES.FOOTPRINT_NEW,
  NOTIFICATION_TYPE_VALUES.LIKE_OLD,
  NOTIFICATION_TYPE_VALUES.LIKE_NEW,
] as const;

export const NOTIFICATION_TYPE_LABELS = {
  [NotificationType.ALL]: 'すべて',
  [NotificationType.FOOTPRINT]: '足あと',
  [NotificationType.LIKE]: 'いいね',
};

export const mapNotiTypeToCategory = (notiType: number): NotificationType => {
  if (
    notiType === NOTIFICATION_TYPE_VALUES.FOOTPRINT_OLD ||
    notiType === NOTIFICATION_TYPE_VALUES.FOOTPRINT_NEW
  ) {
    return NotificationType.FOOTPRINT;
  } else if (
    notiType === NOTIFICATION_TYPE_VALUES.LIKE_OLD ||
    notiType === NOTIFICATION_TYPE_VALUES.LIKE_NEW
  ) {
    return NotificationType.LIKE;
  } else {
    return NotificationType.ALL;
  }
};

// 通知タイプチェック用のヘルパー関数
export const isFootprintNotification = (notiType: number): boolean => {
  return (
    notiType === NOTIFICATION_TYPE_VALUES.FOOTPRINT_OLD ||
    notiType === NOTIFICATION_TYPE_VALUES.FOOTPRINT_NEW
  );
};

export const isLikeNotification = (notiType: number): boolean => {
  return (
    notiType === NOTIFICATION_TYPE_VALUES.LIKE_OLD ||
    notiType === NOTIFICATION_TYPE_VALUES.LIKE_NEW
  );
};

export const isUserDetailDisplayTarget = (notiType: number): boolean => {
  return USER_DETAIL_NOTIFICATION_TYPES.includes(notiType as any);
};

export const isSystemNotification = (notiType: number): boolean => {
  return notiType === NOTIFICATION_TYPE_VALUES.SYSTEM;
};
