// Image component removed (use <img> directly);
import { useRouter } from 'next/router';
import type React from 'react';
import { memo, useEffect, useState } from 'react';
import RoundedThumbnail from '@/components/RoundedThumbnail';
import { GET_RECOMMENDED_USERS } from '@/constants/endpoints';
import styles from '@/styles/home/recommended/HomeRecommendedUsers.module.css';
import type { MeetPerson } from '@/types/MeetPerson';
import { postToNext } from '@/utils/next';

const newUserPic = '/beginner.icon.webp';

import { determineOnlineStatusColor } from '@/utils/personality';
import MeetPeopleCallIcon from '../meetpeople/MeetPeopleCallIcon';

type RecommendedUser = MeetPerson & {
  hasLovense: boolean;
};

const HomeRecommendedUsers: React.FC = () => {
  const router = useRouter();
  const [recommendedUsers, setRecommendedUsers] = useState<RecommendedUser[]>(
    [],
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRecommendedUsers = async () => {
      try {
        setIsLoading(true);
        const response = await postToNext<{
          recommendedUsers: RecommendedUser[];
        }>(GET_RECOMMENDED_USERS, {});

        if (response.type === 'error') {
          console.error('Error fetching recommended users:', response.message);
          setRecommendedUsers([]);
        } else {
          setRecommendedUsers(response.recommendedUsers);
        }
      } catch (error) {
        console.error('Error fetching recommended users:', error);
        setRecommendedUsers([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecommendedUsers();
  }, []);

  const handleClick = (userId: string) => {
    router.push(`/profile/unbroadcaster/${userId}`);
  };

  if (isLoading) {
    return (
      <div className={styles.container}>
        <h5 className={styles.title}>おすすめユーザー</h5>
        <div className={styles.loader}></div>
      </div>
    );
  }

  if (recommendedUsers.length === 0) {
    return null;
  }

  return (
    <div className={styles.container}>
      <h5 className={styles.title}>　あなたへのオススメ</h5>
      <div className={styles.gridContainer}>
        {recommendedUsers.map((user) => (
          <div
            key={user.userId}
            className={styles.gridItem}
            onClick={() => handleClick(user.userId)}
          >
            <div className={styles.wrapper}>
              <div className={styles.thumbnailWrapper}>
                <RoundedThumbnail
                  avatarId={user.avatarId}
                  customSize={{
                    width: 100,
                    height: 100,
                  }}
                  deviceCategory="mobile"
                />
                {user.isNewUser && (
                  <div className={styles.beginnerIcon}>
                    <Image
                      src={newUserPic}
                      alt="新人マーク"
                      width={30}
                      height={30}
                    />
                  </div>
                )}
                <div
                  style={{ position: 'absolute', top: 4, left: 0, zIndex: 20 }}
                >
                  <MeetPeopleCallIcon
                    meetPerson={user}
                    width={20}
                    height={20}
                  />
                </div>
              </div>
            </div>
            <div className={styles.userInfo}>
              <div className={styles.userStatus}>
                <div
                  className={`${styles.onlineStatus} ${
                    styles[determineOnlineStatusColor(user.lastLoginTime)]
                  }`}
                />
                <div className={styles.userName}>
                  {user.userName} {user.age}歳
                </div>
              </div>
              <div className={styles.userAbout}>
                {user.about.length > 15
                  ? `${user.about.slice(0, 15)}...`
                  : user.about}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default memo(HomeRecommendedUsers);
HomeRecommendedUsers.displayName = 'HomeRecommendedUsers';
