// Image component removed (use <img> directly);
import type { rankedMeetPerson } from '@/features/gallery/ranking/index.hook';
import styles from '@/styles/PCGallery.module.css';
import { imageUrl } from '@/utils/image';

const beginnerPic = '/situation.icon/beginner_g.webp';

import { useState } from 'react';
import { useRequest } from '@/hooks/useRequest';
import { trackEvent } from '@/utils/eventTracker';

type MoviesGalleryProps = {
  videoRankingList: rankedMeetPerson[];
};

const PCRankingMoviesGallery: React.FC<MoviesGalleryProps> = ({
  videoRankingList,
}) => {
  const [videoRankingUsers, setVideoRankingUsers] = useState(videoRankingList);
  const { requestVideo } = useRequest();

  const parseTimestamp = (timestamp: string): Date => {
    const year = Number(timestamp.slice(0, 4));
    const month = Number(timestamp.slice(4, 6)) - 1; // months are 0-based in JavaScript Date
    const day = Number(timestamp.slice(6, 8));
    const hour = Number(timestamp.slice(8, 10));
    const minute = Number(timestamp.slice(10, 12));
    const second = Number(timestamp.slice(12, 14));
    const parsedDate = new Date(
      Date.UTC(year, month, day, hour, minute, second),
    );

    return parsedDate;
  };

  const rankingItems = videoRankingUsers.map((user) => {
    const determineThumbnailClass = (rank: number) => {
      switch (rank) {
        case 1:
          return `${styles.rank} ${styles.gold} `;
        case 2:
          return `${styles.rank} ${styles.silver}`;
        case 3:
          return `${styles.rank} ${styles.bronze}`;
        default:
          return;
      }
    };

    const thumbnailClass = determineThumbnailClass(user.rank);

    const determineOnlineStatusColor = (
      lastOnlineTimestamp: string,
    ): string => {
      const currentTime = Date.now();
      const lastOnlineTime = parseTimestamp(lastOnlineTimestamp);

      if (!lastOnlineTime) {
        return 'status-grey'; // default color in case of error or undefined
      }

      const diffTime = currentTime - lastOnlineTime.getTime();

      if (diffTime <= 8 * 60 * 60 * 1000) {
        // online within the last 8 hours
        return 'status-green'; // online
      } else if (diffTime <= 24 * 60 * 60 * 1000) {
        // online within the last 24 hours
        return 'status-orange'; // online within 24 hours
      } else {
        // online more than 24 hours ago
        return 'status-grey'; // online more than 24 hours ago
      }
    };

    const sendMovieRequest = async (user: rankedMeetPerson) => {
      const result = await requestVideo(user.user_id);
      if (result.success) {
        alert('動画リクエストを送信しました');
        trackEvent('COMPLETE_SEND_VIDEO_FILE_REQUEST');

        // 送信済みのユーザーはリクエストボタンを非表示にする
        setVideoRankingUsers(
          videoRankingUsers.map((video) =>
            video.user_id === user.user_id
              ? { ...video, isSendRequest: true }
              : video,
          ),
        );
      } else {
        console.error('video request:', result.error);
      }
    };

    const stopPropagation = (e: React.MouseEvent) => {
      e.stopPropagation(); // 伝播を停止
    };

    return (
      <li key={user.user_id}>
        <div
          onClick={() => {
            window.location.href = `/profile/unbroadcaster/${user.user_id}`;
          }}
          className={styles.wrapper}
        >
          <div className={thumbnailClass}>
            <Image
              src={imageUrl(user.ava_id)}
              placeholder="empty"
              width={150}
              height={150}
              style={{ objectFit: 'cover' }}
              alt="画像"
            />
          </div>
          {user.is_new && (
            <div className={styles.heart}>
              <Image src={beginnerPic} width={20} height={25} alt="新人" />
            </div>
          )}
          <div
            onClick={(e) => {
              stopPropagation(e);
              sendMovieRequest(user);
            }}
            className={styles.movieRequest}
            style={{
              display: user.isSendRequest ? 'none' : 'block',
            }}
          >
            動画リクエスト
          </div>
        </div>
        <div className={styles.userStatus}>
          <div
            className={`${
              styles[determineOnlineStatusColor(user.last_login_time)]
            }`}
          />
          <div className={styles.name}>
            {user.user_name}　{user.age}歳　{user.region}
          </div>
        </div>
      </li>
    );
  });

  return <ul className={styles.list}>{rankingItems}</ul>;
};

export default PCRankingMoviesGallery;
