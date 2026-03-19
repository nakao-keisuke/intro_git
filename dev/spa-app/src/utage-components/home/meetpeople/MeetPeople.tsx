// Image component removed (use <img> directly);
import React, { useEffect } from 'react';
import MeetPeopleCallIcon from '@/components/home/meetpeople/MeetPeopleCallIcon';
import styles from '@/styles/home/meetpeople/MeetPeople.module.css';
import type { MeetPerson } from '@/types/MeetPerson';
import { imageUrl } from '@/utils/image';
import { region as convertRegionIdToRegion } from '@/utils/region';

const logoPic = '/miseai_livechat_utage_icon.webp';

import { useRef, useState } from 'react';
import { useMeetPeopleMore } from '@/hooks/requests/useMeetPeopleMore';

const LovensePic = '/lovense_pink.webp';
const storyPic = '/has_story.webp';
const newUserPic = '/beginner.icon.webp';

import { Link } from '@tanstack/react-router';
import { determineOnlineStatusColor } from '@/utils/personality';
import { getRankImage } from '@/utils/ranking';
import HomeRecommendedUsers from '../recommended/HomeRecommendedUsers';

type Props = {
  meetPeople: (MeetPerson & {
    isCallWaiting: boolean;
    rank?: number;
    hasLovense: boolean;
  })[];
};

const MeetPeople = ({ meetPeople }: Props) => {
  const [users, setUsers] =
    useState<
      (MeetPerson & {
        isCallWaiting: boolean;
        rank?: number;
        hasLovense: boolean;
      })[]
    >(meetPeople);

  const markerRef = useRef<HTMLLIElement | null>(null);
  const isFetching = useRef(false);
  const { fetchMoreUsers: fetchMoreUsersApi } = useMeetPeopleMore();

  // ユーザーの追加読み込み
  const fetchMoreUsers = async () => {
    if (isFetching.current || users.length === 0) return;

    isFetching.current = true;

    try {
      const lastUserLoginTime = users[users.length - 1]?.lastLoginTime ?? null;

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
        (newUser) => !users.find((user) => user.userId === newUser.userId),
      );

      setUsers((prevUsers) => [...prevUsers, ...newUsers]);
    } catch (error) {
      console.error('Error fetching more users:', error);
    } finally {
      isFetching.current = false;
    }
  };

  // ユーザーの追加読み込みを監視
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry?.isIntersecting) {
          fetchMoreUsers();
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
  }, [users]);

  // const handleClick = (userId: string) => {
  //   const scrollPosition =
  //     window.pageYOffset ||
  //     document.documentElement.scrollTop ||
  //     document.body.scrollTop;
  //   sessionStorage.setItem('homeScroll', String(scrollPosition));
  // };

  // useEffect(() => {
  //   const savedScrollPosition = sessionStorage.getItem('homeScroll');

  //   if (savedScrollPosition) {
  //     setTimeout(() => {
  //       window.scrollTo(0, parseInt(savedScrollPosition));

  //       sessionStorage.removeItem('homeScroll');
  //     }, 1000); // 遅延時間を調整
  //   }
  // }, [router]);

  // ランクによって画像を変える
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

  // 表示ユーザーのリスト作成
  const meetPeopleItems = users.map((meetPerson, index) => {
    const thumbnailClass = determineThumbnailClass(
      meetPerson.hasStory,
      meetPerson.rank,
    );
    const rankImage = getRankImage(meetPerson.rank);

    return (
      <li className={styles.regularRankCell} key={meetPerson.userId}>
        <div className={styles.set}>
          <Link href={`/profile/unbroadcaster/${meetPerson.userId}`}>
            {meetPerson.isCalling && (
              <div className={styles.callingLabel}>ビデオ通話中</div>
            )}
            {meetPerson.isCallWaiting && (
              <div className={styles.boardLabel}>着信待ち</div>
            )}
            {meetPerson.isNewUser && (
              <div className={`${styles.beginnerIcon}`}>
                <div className={styles.ribbon17content}>
                  <span className={styles.ribbon17}>
                    <Image
                      src={newUserPic}
                      alt="新人マーク"
                      style={{
                        width: 35,
                        height: 35,
                      }}
                    />
                  </span>
                </div>
              </div>
            )}
            <div className={thumbnailClass}>
              <Image
                src={imageUrl(meetPerson.avatarId, meetPerson.userId)}
                alt="ユーザー画像"
                placeholder="empty"
                quality={75}
                priority={index < 9}
                width={120}
                height={120}
                style={{
                  objectFit: 'cover',
                  borderRadius: '5vw',
                  display: 'block',
                }}
              />
            </div>
            {rankImage && (
              <Image
                src={rankImage.src}
                alt={rankImage.alt}
                placeholder="empty"
                width={40}
                height={40}
                style={{
                  position: 'absolute',
                  bottom: 8,
                  left: 3,
                  borderRadius: '5vw',
                  zIndex: 11,
                }}
              />
            )}
            <Image
              src={logoPic}
              alt="サイトロゴ"
              placeholder="empty"
              width={52}
              height={40}
              style={{
                position: 'absolute',
                top: '-6px',
                left: 10,
                zIndex: 10,
              }}
            />
            {meetPerson.hasLovense && (
              <Image
                src={LovensePic}
                alt="Lovense"
                placeholder="empty"
                className={styles.lovense}
                priority={index < 3}
                style={{
                  width: 30,
                  height: 30,
                  position: 'absolute',
                  bottom: '0',
                  right: 0,
                }}
              />
            )}
            <div style={{ position: 'absolute', top: 4, right: 8, zIndex: 20 }}>
              <MeetPeopleCallIcon
                meetPerson={meetPerson}
                width={21}
                height={21}
              />
            </div>
            <div className={styles.userStatus}>
              <div className={styles.userContainer}>
                <div
                  className={`${
                    styles[determineOnlineStatusColor(meetPerson.lastLoginTime)]
                  }`}
                />
              </div>
              <div className={styles.username}>
                <div className={styles.leftInfo}>
                  <span className={styles.name}>
                    {meetPerson.userName?.length > 4
                      ? `${meetPerson.userName.slice(0, 4)}...`
                      : meetPerson.userName}
                  </span>
                </div>
                <span className={styles.region}>{meetPerson.region}</span>

                <span className={styles.age}>{meetPerson.age}歳</span>
              </div>
              {meetPerson.hasStory && (
                <div className={styles.story}>
                  <Image
                    src={storyPic}
                    alt="ストーリー"
                    width={16}
                    height={16}
                  />
                </div>
              )}
            </div>
          </Link>
          <div className={styles.about}>{meetPerson.about}</div>
        </div>
      </li>
    );
  });

  return (
    <>
      <ul className={styles.container} data-behavior="meet-people-grid">
        {meetPeopleItems.map((item, index) => {
          // 6番目のユーザーにはレコメンドユーザーを表示
          if (index === 6) {
            return (
              <React.Fragment key={`recommended-${index}`}>
                <div className={styles.recommendedUsers}>
                  <HomeRecommendedUsers />
                </div>
                {item}
              </React.Fragment>
            );
          }
          return item;
        })}
      </ul>
      <center>
        <span ref={markerRef} />
      </center>
    </>
  );
};

export default MeetPeople;
