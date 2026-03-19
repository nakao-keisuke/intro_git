import { IconHeart } from '@tabler/icons-react';
// Image component removed (use <img> directly);
import { useNavigate } from '@tanstack/react-router';
import type React from 'react';
import { useEffect, useState } from 'react';
import { GET_RECOMMENDED_USERS } from '@/constants/endpoints';
import { useFavorite } from '@/hooks/useFavorite';
import pcStyles from '@/styles/profile/PCPartnerProfile.module.css';
import styles from '@/styles/profile/RecommendedUsers.module.css';
import type { MeetPerson } from '@/types/MeetPerson';
import { postToNext } from '@/utils/next';
import { parseTimestamp } from '@/utils/time';
import newUserPic from '../../../public/beginner.icon.webp';
import MeetPeopleCallIcon from '../home/meetpeople/MeetPeopleCallIcon';
import RoundedThumbnail from '../RoundedThumbnail';

type Props = {
  partnerId: string;
  isMobile: boolean;
};

type RecommendedUser = MeetPerson & {
  hasLovense: boolean;
  isLiked?: boolean;
};

const RecommendedUsers: React.FC<Props> = ({ partnerId, isMobile }) => {
  const router = useRouter();
  const [recommendedUsers, setRecommendedUsers] = useState<RecommendedUser[]>(
    [],
  );
  const [isLoading, setIsLoading] = useState(true);
  const [likingUsers, setLikingUsers] = useState<Set<string>>(new Set());
  const [navigatingTo, setNavigatingTo] = useState<string | null>(null);
  const { addFavorite } = useFavorite();

  // スクロール可能な全てのコンテナを試す
  const scrollToTop = () => {
    // デバイスタイプに応じて異なるスクロール動作を使用
    const scrollBehavior = isMobile ? 'auto' : 'smooth';

    // 各コンテナのスクロールを試行
    const containers = [
      document.getElementById('profile-container'), // モバイルコンテナ
      document.querySelector(`.${pcStyles.contentArea}`), // PCコンテンツエリア
      document.querySelector(`.${pcStyles.content}`), // PCコンテンツ
      document.body, // フォールバック
    ];

    containers.forEach((container) => {
      if (container) {
        container.scrollTo({ top: 0, behavior: scrollBehavior });
      }
    });

    // 最終的なフォールバックとしてウィンドウもスクロール
    window.scrollTo({ top: 0, behavior: scrollBehavior });
  };

  useEffect(() => {
    const fetchRecommendedUsers = async () => {
      try {
        const response = await postToNext<{
          recommendedUsers: RecommendedUser[];
        }>(GET_RECOMMENDED_USERS, {});

        if (response.type === 'error') {
          console.error('Error fetching recommended users:', response.message);
          setRecommendedUsers([]);
        } else {
          setRecommendedUsers(
            response.recommendedUsers.map((user) => ({
              ...user,
              isLiked: false,
            })),
          );
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

  const determineOnlineStatusColor = (lastOnlineTimestamp: string): string => {
    if (!lastOnlineTimestamp) {
      return 'status-grey';
    }

    const currentTime = Date.now();
    const lastOnlineTime = parseTimestamp(lastOnlineTimestamp);

    if (!lastOnlineTime) {
      return 'status-grey';
    }

    const diffTime = currentTime - lastOnlineTime.getTime();

    if (diffTime <= 8 * 60 * 60 * 1000) {
      return 'status-green';
    } else if (diffTime <= 24 * 60 * 60 * 1000) {
      return 'status-orange';
    } else {
      return 'status-grey';
    }
  };

  const heartIconClass = styles.heartIcon || '';

  const handleLike = async (userId: string, event: React.MouseEvent) => {
    event.stopPropagation();

    if (likingUsers.has(userId)) {
      return;
    }

    setLikingUsers((prev) => new Set(prev).add(userId));

    const { success } = await addFavorite(userId);

    if (success) {
      setRecommendedUsers((prev) =>
        prev.map((user) =>
          user.userId === userId ? { ...user, isLiked: true } : user,
        ),
      );
    }

    setTimeout(() => {
      setLikingUsers((prev) => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    }, 4000);
  };

  const handleClick = (userId: string) => {
    if (userId === partnerId) return; // 同じプロフィールの場合は遷移しない

    setNavigatingTo(userId); // 遷移先のIDを設定

    router.push(`/profile/unbroadcaster/${userId}`);

    scrollToTop();
    setNavigatingTo(null); // 遷移状態をリセット
  };

  const normalMessage = (userId: string) => {
    router.push(`/message/${userId}`);
  };

  if (isLoading) {
    return null;
  }

  if (recommendedUsers.length === 0) {
    return null;
  }

  return (
    <div className={styles.recommendedUsers}>
      <div className={styles.title}>あなたへのおすすめユーザー</div>
      <div className={styles.usersContainer}>
        {recommendedUsers.map((user) => (
          <div
            key={user.userId}
            className={`${styles.userCard} ${
              navigatingTo === user.userId ? styles.navigating : ''
            }`}
            onClick={() => handleClick(user.userId)}
          >
            <div className={styles.thumbnailWrapper}>
              {navigatingTo === user.userId && (
                <div className={styles.loadingOverlay}>ロード中...</div>
              )}
              {user.isNewUser && (
                <div className={styles.beginnerIcon}>
                  <Image
                    src={newUserPic}
                    alt="新人マーク"
                    width={isMobile ? 25 : 30}
                    height={isMobile ? 25 : 30}
                  />
                </div>
              )}

              <RoundedThumbnail
                avatarId={user.avatarId}
                customSize={{
                  width: isMobile ? 130 : 140,
                  height: isMobile ? 130 : 140,
                }}
                deviceCategory={isMobile ? 'mobile' : 'desktop'}
              />
              <div
                style={{ position: 'absolute', top: 4, left: 8, zIndex: 20 }}
              >
                <MeetPeopleCallIcon
                  meetPerson={user}
                  width={isMobile ? 25 : 35}
                  height={isMobile ? 25 : 35}
                />
              </div>
            </div>
            <div className={styles.userInfo}>
              <div className={styles.userName}>
                <div className={styles.Name}>
                  <div
                    className={`${styles.onlineStatus} ${
                      styles[determineOnlineStatusColor(user.lastLoginTime)]
                    }`}
                  />
                  {user.userName.length > 10
                    ? `${user.userName.slice(0, 10)}...`
                    : user.userName}
                </div>
                <div className={styles.userage}>{user.age}歳</div>
              </div>
              <div className={styles.userDetails}>
                <div className={styles.userAbout}>
                  {user.about.length > 30
                    ? `${user.about.slice(0, 25)}...`
                    : user.about}
                </div>
              </div>
              <div
                className={styles.actions}
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                }}
              >
                <div
                  className={`${styles.likeButton} ${
                    user.isLiked ? styles.liked : ''
                  }`}
                  onClick={(e) => handleLike(user.userId, e)}
                >
                  <div className={styles.likeIcon}>
                    <IconHeart size={20} className={heartIconClass} />
                  </div>
                  <span>{user.isLiked ? 'いいね済' : 'いいね'}</span>
                </div>
                <div
                  className={styles.chat}
                  onClick={() => normalMessage(user.userId)}
                >
                  メッセージ
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecommendedUsers;
