// Image component removed (use <img> directly);
import { useRouter } from 'next/router';
import { useCallback } from 'react';
import MeetPeopleCallIcon from '@/components/home/meetpeople/MeetPeopleCallIcon';
import styles from '@/styles/home/meetpeople/PCMeetPeople.module.css';
import type { MeetPerson } from '@/types/MeetPerson';
import { imageUrl } from '@/utils/image';
import type { MeetPeopleMode } from './MeetPeopleListCard';

const logoPic = '/miseai_livechat_utage_icon.webp';
const newUserPic = '/beginner.icon.webp';
const firstRankPic = '/situation.icon/1st.webp';
const secondRankPic = '/situation.icon/2nd.webp';
const thirdRankPic = '/situation.icon/3rd.webp';

import { useEffect, useRef, useState } from 'react';
import PCRankingModeDisplay from '@/components/home/meetpeople/PCRankingMode';
import { useMeetPeopleMore } from '@/hooks/requests/useMeetPeopleMore';
import { region as convertRegionIdToRegion } from '@/utils/region';

const LovensePic = '/lovense_pink.webp';
type Props = {
  currentMode: MeetPeopleMode;

  rankingMeetPeople: (MeetPerson & {
    isCallWaiting: boolean;
    rank?: number;
    hasLovense: boolean;
  })[];
  videochatRankingMeetPeople: (MeetPerson & {
    isLive: boolean;
    isCallWaiting: boolean;
    rank?: number;
    hasLovense: boolean;
  })[];
  twoshotRankingMeetPeople: (MeetPerson & {
    isLive: boolean;
    isCallWaiting: boolean;
    rank?: number;
    hasLovense: boolean;
  })[];
  chatRankingMeetPeople: (MeetPerson & {
    isLive: boolean;
    isCallWaiting: boolean;
    rank?: number;
    hasLovense: boolean;
  })[];
  totalRankingMeetPeople: (MeetPerson & {
    isLive: boolean;
    isCallWaiting: boolean;
    rank?: number;
    hasLovense: boolean;
  })[];
  newComerMeetPeople: (MeetPerson & {
    isCallWaiting: boolean;
    rank?: number;
    hasLovense: boolean;
  })[];
  loginMeetPeople: (MeetPerson & {
    isCallWaiting: boolean;
    rank?: number;
    hasLovense: boolean;
  })[];
};
const getRankImage = (rank: number | undefined) => {
  switch (rank) {
    case 1:
      return { src: firstRankPic, alt: '1位' };
    case 2:
      return { src: secondRankPic, alt: '2位' };
    case 3:
      return { src: thirdRankPic, alt: '3位' };
    default:
      return undefined;
  }
};
const PCMeetPeople = ({
  currentMode,
  rankingMeetPeople,
  videochatRankingMeetPeople,
  twoshotRankingMeetPeople,
  chatRankingMeetPeople,
  totalRankingMeetPeople,
  newComerMeetPeople,
  loginMeetPeople,
}: Props) => {
  const router = useRouter();
  const { fetchMoreUsers: fetchMoreUsersApi } = useMeetPeopleMore();

  const [loginUsers, setLoginUsers] =
    useState<
      (MeetPerson & {
        isCallWaiting: boolean;
        rank?: number;
        hasLovense: boolean;
      })[]
    >(loginMeetPeople);
  const [newComerUsers, setNewComerUsers] =
    useState<
      (MeetPerson & {
        isCallWaiting: boolean;
        rank?: number;
        hasLovense: boolean;
      })[]
    >(newComerMeetPeople);
  const markerRef = useRef<HTMLLIElement | null>(null);

  const isFetching = useRef(false);
  const isNewFetching = useRef(false);

  const fetchMoreUsers = async () => {
    if (isFetching.current || loginUsers.length === 0) return;

    isFetching.current = true;

    try {
      const lastUserLoginTime =
        loginUsers[loginUsers.length - 1]?.lastLoginTime ?? null;

      const result = await fetchMoreUsersApi(lastUserLoginTime);

      if (!result.success || !result.data || result.data.length === 0) {
        return;
      }

      // MeetPeople型からMeetPerson型に変換
      const transformedUsers: (MeetPerson & {
        isCallWaiting: boolean;
        rank?: number;
        hasLovense: boolean;
      })[] = result.data.map((user) => ({
        userId: user.userId,
        avatarId: user.avaId,
        about: user.abt,
        age: user.age,
        userName: user.userName,
        region: convertRegionIdToRegion(user.region),
        voiceCallWaiting: user.voiceCallWaiting,
        videoCallWaiting: user.videoCallWaiting,
        isNewUser: user.isNewUser,
        isCalling: user.isCalling,
        lastLoginTime: user.lastLoginTime,
        hasStory: user.hasStoryMovie,
        isCallWaiting: user.videoCallWaiting || user.voiceCallWaiting,
        hasLovense: user.hasLovense,
        isListedOnFleaMarket: user.isListedOnFleaMarket,
        ...(user.bustSize && { bustSize: user.bustSize }),
      }));

      const newUsers = transformedUsers.filter(
        (newUser) => !loginUsers.find((user) => user.userId === newUser.userId),
      );

      setLoginUsers((prevUsers) => [...prevUsers, ...newUsers]);
    } catch (error) {
      console.error('Error fetching more users:', error);
    } finally {
      isFetching.current = false;
    }
  };

  const newFetchMoreUsers = async () => {
    if (isNewFetching.current || newComerUsers.length === 0) return;

    isNewFetching.current = true;

    try {
      const lastUserLoginTime =
        newComerUsers[newComerUsers.length - 1]?.lastLoginTime ?? null;

      const result = await fetchMoreUsersApi(lastUserLoginTime);

      if (!result.success || !result.data || result.data.length === 0) {
        return;
      }

      // MeetPeople型からMeetPerson型に変換
      const transformedUsers: (MeetPerson & {
        isCallWaiting: boolean;
        rank?: number;
        hasLovense: boolean;
      })[] = result.data.map((user) => ({
        userId: user.userId,
        avatarId: user.avaId,
        about: user.abt,
        age: user.age,
        userName: user.userName,
        region: convertRegionIdToRegion(user.region),
        voiceCallWaiting: user.voiceCallWaiting,
        videoCallWaiting: user.videoCallWaiting,
        isNewUser: user.isNewUser,
        isCalling: user.isCalling,
        lastLoginTime: user.lastLoginTime,
        hasStory: user.hasStoryMovie,
        isCallWaiting: user.videoCallWaiting || user.voiceCallWaiting,
        hasLovense: user.hasLovense,
        isListedOnFleaMarket: user.isListedOnFleaMarket,
        ...(user.bustSize && { bustSize: user.bustSize }),
      }));

      const newUsers = transformedUsers.filter(
        (newUser) =>
          !newComerUsers.find((user) => user.userId === newUser.userId),
      );

      setNewComerUsers((prevUsers) => [...prevUsers, ...newUsers]);
    } catch (error) {
      console.error('newError fetching more users:', error);
    } finally {
      isNewFetching.current = false;
    }
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry?.isIntersecting) {
          if (currentMode === 'login' && !isFetching.current) {
            fetchMoreUsers();
          }
          if (currentMode === 'new' && !isNewFetching.current) {
            newFetchMoreUsers();
          }
        }
      },
      {
        root: null,
        rootMargin: '0px',
        threshold: 0.1,
      },
    );

    if (markerRef.current) {
      observer.observe(markerRef.current);
    }

    return () => {
      if (markerRef.current) {
        observer.unobserve(markerRef.current);
      }
    };
  }, [loginUsers, newComerUsers, currentMode]);

  const handleClick = useCallback(
    (userId: string) => {
      router.push(
        {
          pathname: `/profile/unbroadcaster/pc/${userId}`,
        },
        undefined,
        { scroll: true },
      );
    },
    [router],
  );

  if (!PCMeetPeople) {
    return <div />;
  }

  if (currentMode === 'ranking') {
    return (
      <PCRankingModeDisplay
        videochatRankingMeetPeople={videochatRankingMeetPeople}
        twoshotRankingMeetPeople={twoshotRankingMeetPeople}
        chatRankingMeetPeople={chatRankingMeetPeople}
        currentMode={currentMode}
      />
    );
  }

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

  const determineOnlineStatusColor = (lastOnlineTimestamp: string): string => {
    const currentTime = Date.now();
    const lastOnlineTime = parseTimestamp(lastOnlineTimestamp);

    if (!lastOnlineTime) {
      return 'status-grey'; // default color in case of error or undefined
    }

    const diffTime = currentTime - lastOnlineTime.getTime();

    if (diffTime <= 8 * 60 * 60 * 1000) {
      // online within the last 6 hours
      return 'status-green'; // online
    } else if (diffTime <= 24 * 60 * 60 * 1000) {
      // online within the last 24 hours
      return 'status-orange'; // online within 24 hours
    } else {
      // online more than 24 hours ago
      return 'status-grey'; // online more than 24 hours ago
    }
  };

  const determineThumbnailClass = (
    hasStory: boolean,
    rank?: number,
  ): string => {
    switch (rank) {
      case 1:
        return `${styles.thumbnail} ${styles.gold} `;
      case 2:
        return `${styles.thumbnail} ${styles.silver}`;
      case 3:
        return `${styles.thumbnail} ${styles.bronze}`;
    }

    return hasStory
      ? `${styles.thumbnail} ${styles.hasStory}`
      : `${styles.thumbnail}`;
  };

  const meetPeopleItems = (
    currentMode === 'login' ? loginUsers : newComerUsers
  ).map((meetPerson, index) => {
    const thumbnailClass = determineThumbnailClass(
      meetPerson.hasStory,
      meetPerson.rank,
    );
    const rankImage = getRankImage(meetPerson.rank);
    return (
      <li
        key={meetPerson.userId}
        className={`${styles.cell} ${currentMode === 'new' ? styles.rank : ''}`}
      >
        <div
          className={styles.set}
          onClick={() => handleClick(meetPerson.userId)}
        >
          {rankImage && (
            <div className={styles.rankingImage}>
              <Image
                src={rankImage.src}
                alt={rankImage.alt}
                placeholder="empty"
                width={50}
                height={50}
                style={{
                  borderRadius: '5px',
                }}
              />
            </div>
          )}
          <div className={styles.set}>
            <div style={{ position: 'absolute', top: 4, right: 8, zIndex: 20 }}>
              <MeetPeopleCallIcon
                meetPerson={meetPerson}
                width={25}
                height={25}
              />
            </div>
            {meetPerson.isCalling && (
              <div className={styles.callingLabel}>２ショット中</div>
            )}
            {meetPerson.isCallWaiting && (
              <div className={styles.boardLabel}>着信待ち</div>
            )}
            {meetPerson.isNewUser && (
              <div
                className={`${styles.beginnerIcon} ${
                  currentMode === 'new' ? styles.noShine : ''
                }`}
              >
                <div className={styles.ribbon17content}>
                  <span className={styles.ribbon17}>
                    <Image
                      src={newUserPic}
                      alt="新人マーク"
                      style={{
                        width: '40px',
                        height: '40px',
                      }}
                    />
                  </span>
                </div>
              </div>
            )}

            <div className={styles.thumbnail}>
              {meetPerson.hasLovense && (
                <Image
                  src={LovensePic}
                  alt="Lovense"
                  placeholder="empty"
                  className={styles.lovense}
                  priority={index < 3}
                  width={25}
                  height={25}
                  style={{
                    position: 'absolute',
                    bottom: '0',
                    right: 0,
                  }}
                />
              )}
              <div className={thumbnailClass}>
                <Image
                  src={imageUrl(meetPerson.avatarId, meetPerson.userId)}
                  alt="ユーザー画像"
                  placeholder="empty"
                  quality={100}
                  priority={index < 9}
                  width={160}
                  height={160}
                  style={{
                    objectFit: 'cover',
                    borderRadius: '1vw',
                    display: 'block',
                  }}
                />
                <Image
                  src={logoPic}
                  alt="サイトロゴ"
                  placeholder="empty"
                  width={49}
                  height={40}
                  style={{
                    position: 'absolute',
                    top: '-5px',
                    left: 10,
                  }}
                />
              </div>
            </div>
          </div>
          <div className={styles.userStatus}>
            <div
              className={`${
                styles[determineOnlineStatusColor(meetPerson.lastLoginTime)]
              }`}
            />
            <div className={styles.username}>
              <span className={styles.region}>{meetPerson.region}</span>
              <span className={styles.age}>
                <span className={styles.sai}>{meetPerson.age}歳</span>
              </span>
              {meetPerson.userName}
            </div>
          </div>
        </div>
      </li>
    );
  });

  return (
    <>
      <ul className={styles.container}>{meetPeopleItems}</ul>
      <center>
        <span ref={markerRef} />
      </center>
    </>
  );
};

export default PCMeetPeople;
