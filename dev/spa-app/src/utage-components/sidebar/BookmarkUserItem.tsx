import { Link } from '@tanstack/react-router';
import { useMemo } from 'react';
import RoundedThumbnail from '@/components/RoundedThumbnail';
import type { BookmarkListUserInfo } from '@/services/bookmark-list/type';
import { getOnlineStatus } from '@/utils/time';

interface BookmarkUserItemProps {
  user: BookmarkListUserInfo;
}

export default function BookmarkUserItem({ user }: BookmarkUserItemProps) {
  const onlineStatus = useMemo(
    () => getOnlineStatus(user.lastLoginTime || ''),
    [user.lastLoginTime],
  );
  const onlineLabel = useMemo(() => {
    switch (onlineStatus.colorType) {
      case 'green':
        return 'オンライン';
      case 'orange':
        return '24時間以内';
      default:
        return '24時間以上';
    }
  }, [onlineStatus.colorType]);

  const statusDotColor = useMemo(() => {
    switch (onlineStatus.colorType) {
      case 'green':
        return 'bg-green-500';
      case 'orange':
        return 'bg-orange-500';
      default:
        return 'bg-gray-400';
    }
  }, [onlineStatus.colorType]);

  return (
    <Link
      href={`/profile/unbroadcaster/${user.userId}`}
      className="flex cursor-pointer items-center gap-2.5 rounded-lg bg-white p-2 text-inherit no-underline transition-all duration-200 hover:bg-gray-100 hover:shadow-sm"
    >
      <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-full">
        <RoundedThumbnail
          avatarId={user.avatarId}
          deviceCategory="mobile"
          customSize={{ width: 50, height: 50 }}
        />
      </div>
      <div className="min-w-0 flex-1">
        <div className="mb-1 overflow-hidden text-ellipsis whitespace-nowrap font-medium text-gray-700 text-sm">
          {user.userName}
        </div>
        <div className="flex items-center gap-1 text-gray-500 text-xs">
          <span
            className={`h-2 w-2 flex-shrink-0 rounded-full ${statusDotColor}`}
          />
          <span className="whitespace-nowrap">{onlineLabel}</span>
        </div>
      </div>
    </Link>
  );
}
