// Image component removed (use <img> directly);
import { memo, useCallback, useEffect, useRef, useState } from 'react';
import { useVideoPeopleInfoList } from '@/hooks/useVideoPeopleInfoList.hook';
import styles from '@/styles/home/livechannel/VideoChannelMeetPeople.module.css';
import { imageUrl } from '@/utils/image';

const LovensePic = '/lovense_pink.webp';

import RoundedThumbnail from '@/components/RoundedThumbnail';

const firstRankPic = '/situation.icon/1st.webp';
const secondRankPic = '/situation.icon/2nd.webp';
const thirdRankPic = '/situation.icon/3rd.webp';
const forthRankPic = '/ranking/4.webp';
const fifthRankPic = '/ranking/5.webp';
const sixthRankPic = '/ranking/6.webp';
const sevnethRankPic = '/ranking/7.webp';
const eighthRankPic = '/ranking/8.webp';
const ninthRankPic = '/ranking/9.webp';
const tenthRankPic = '/ranking/10.webp';
const eleventhRankPic = '/ranking/11.webp';
const twelfthRankPic = '/ranking/12.webp';
const thirteenthRankPic = '/ranking/13.webp';
const forteenthRankPic = '/ranking/14.webp';

import VideoTwoModal from '@/components/videocall/VideoTwoModal';
import type { MeetPerson } from '@/types/MeetPerson';

const newUserPic = '/beginner.icon.webp';
const swipeImg = '/tuto/swipe_img.png';

import { useGetMyInfo } from '@/hooks/useGetMyInfo.hook';
import {
  hasSwipeHintShown,
  markSwipeHintShown,
} from '@/utils/swipeHintStorage';

const getRankImage = (rank: number | undefined) => {
  switch (rank) {
    case 1:
      return { src: firstRankPic, alt: '1位' };
    case 2:
      return { src: secondRankPic, alt: '2位' };
    case 3:
      return { src: thirdRankPic, alt: '3位' };
    case 4:
      return { src: forthRankPic, alt: '4位' };
    case 5:
      return { src: fifthRankPic, alt: '5位' };
    case 6:
      return { src: sixthRankPic, alt: '6位' };
    case 7:
      return { src: sevnethRankPic, alt: '7位' };
    case 8:
      return { src: eighthRankPic, alt: '8位' };
    case 9:
      return { src: ninthRankPic, alt: '9位' };
    case 10:
      return { src: tenthRankPic, alt: '10位' };
    case 11:
      return { src: eleventhRankPic, alt: '11位' };
    case 12:
      return { src: twelfthRankPic, alt: '12位' };
    case 13:
      return { src: thirteenthRankPic, alt: '13位' };
    case 14:
      return { src: forteenthRankPic, alt: '14位' };
    default:
      return undefined;
  }
};

type MeetPersonExtended = MeetPerson & {
  isLive: boolean;
  isCallWaiting: boolean;
  rank?: number;
  hasLovense: boolean;
};

type Props = {
  totalRankingMeetPeople: MeetPersonExtended[];
};

type ModalData = {
  partnerId: string;
  userName: string;
  age: number;
  region: string;
  avatarId: string;
  about: string;
  videoCallWaiting: boolean;
  voiceCallWaiting: boolean;
  isBonusCourseExist: boolean;
} | null;

const determineOnlineStatusColor = (lastOnlineTimestamp: string): string => {
  const currentTime = Date.now();
  const lastOnlineTime = new Date(parseInt(lastOnlineTimestamp, 10));

  if (!lastOnlineTime) {
    return 'status-grey';
  }

  const diffTime = currentTime - lastOnlineTime.getTime();

  if (diffTime <= 80000) {
    return 'status-green';
  } else if (diffTime <= 86400000) {
    return 'status-orange';
  } else if (diffTime > 259200000) {
    return 'status-grey';
  }
  return 'status-grey';
};

const VideoChannelMeetPeople = memo(({ totalRankingMeetPeople }: Props) => {
  const { videoPeopleInfoList, isLoading } = useVideoPeopleInfoList();
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [activeModalData, setActiveModalData] = useState<ModalData>(null);
  const [showSwipeHint, setShowSwipeHint] = useState(false);
  const myInfoState = useGetMyInfo();
  // ログイン状態とデータ読み込み状態の監視用
  const [canShowHint, setCanShowHint] = useState(false);
  const containerRef = useRef<HTMLUListElement>(null);
  // ローカルストレージへの重複保存を防ぐフラグ
  const hasScrolledRef = useRef(false);
  // showSwipeHintを直接依存配列に入れると、状態が変わるたびにハンドラーが再生成される
  // refを使うことで、関数の再生成を防ぎつつ最新の状態にアクセスできる
  const showSwipeHintRef = useRef(false);
  const userIdRef = useRef(myInfoState.data?.userId);

  useEffect(() => {
    showSwipeHintRef.current = showSwipeHint;
  }, [showSwipeHint]);

  useEffect(() => {
    userIdRef.current = myInfoState.data?.userId;
  }, [myInfoState.data?.userId]);

  const handleInteraction = useCallback(() => {
    if (showSwipeHintRef.current) {
      setShowSwipeHint(false);
    }
  }, []);

  // ログイン状態とデータ読み込み状態の監視
  useEffect(() => {
    const isReady: boolean =
      !isLoading && !!myInfoState.isLoginUser && !!myInfoState.data?.userId;
    setCanShowHint(isReady);
  }, [isLoading, myInfoState.isLoginUser, myInfoState.data?.userId]);

  // スワイプヒント表示制御
  useEffect(() => {
    if (canShowHint && videoPeopleInfoList && videoPeopleInfoList.length > 0) {
      // このアカウントで過去にアニメーションを表示したことがあるかチェック
      const userId = myInfoState.data?.userId;
      if (userId && !hasSwipeHintShown(userId)) {
        setShowSwipeHint(true); // 初回のみアニメーションを表示
        hasScrolledRef.current = false;
        // アニメーション表示と同時に「表示済み」として記録（初回表示時のみの要件を満たすため）
        markSwipeHintShown(userId);
      }
    }
  }, [canShowHint, videoPeopleInfoList, myInfoState.data?.userId]);

  // スクロール操作イベントリスナーの設定（⬅︎のアニメーションを停止させるため）
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // スクロール検知
    container.addEventListener('scroll', handleInteraction, { passive: true });
    container.addEventListener('touchstart', handleInteraction, {
      passive: true,
    });

    return () => {
      container.removeEventListener('scroll', handleInteraction);
      container.removeEventListener('touchstart', handleInteraction);
    };
  }, [handleInteraction]);

  const _handleTwoshotModalOpen = (
    event: React.MouseEvent<HTMLDivElement>,
    videoList: MeetPerson,
  ) => {
    event.stopPropagation(); // イベントの伝搬を停止
    event.preventDefault(); // デフォルトのアンカータグの動作を防止
    setActiveModalData({
      partnerId: videoList.userId,
      userName: videoList.userName,
      age: videoList.age,
      region: videoList.region,
      avatarId: videoList.avatarId,
      about: '',
      videoCallWaiting: videoList.videoCallWaiting,
      voiceCallWaiting: videoList.voiceCallWaiting,
      isBonusCourseExist: false,
    });
    setActiveModal('twoshot');
  };
  const closeChoiceModal = () => {
    setActiveModal(null);
  };

  if (isLoading) {
    return (
      <div className={styles.containerFixedHeight}>
        <div className={styles.loader}></div>
      </div>
    );
  }

  const filterVideoPeopleInfoList = videoPeopleInfoList?.filter(
    ({ meetPerson }) => meetPerson.videoCallWaiting,
  );

  if (!videoPeopleInfoList) {
    return (
      <ul className={styles.container}>
        <li className={styles.none}></li>
      </ul>
    );
  }

  if (!videoPeopleInfoList.length) {
    return (
      <ul className={styles.smallContainer}>
        <li className={styles.none}>現在着信待ちの女の子はいません。</li>
      </ul>
    );
  }

  const items = filterVideoPeopleInfoList?.map(({ meetPerson }, index) => {
    const meetPersonRank = totalRankingMeetPeople.find(
      (rankingMeetPerson) => rankingMeetPerson.userId === meetPerson.userId,
    );
    const rankImage = getRankImage(meetPersonRank?.rank);

    return (
      <li className={styles.cell} key={meetPerson.userId}>
        <a href={`/profile/unbroadcaster/${meetPerson.userId}`}>
          <div className={styles.thumbnail}>
            <RoundedThumbnail
              avatarId={imageUrl(meetPerson.avatarId)}
              deviceCategory="mobile"
              customSize={{ width: 90, height: 90 }}
              priority={index < 3}
            />
            {rankImage && (
              <Image
                src={rankImage.src}
                alt={rankImage.alt}
                placeholder="empty"
                width={30}
                height={30}
                style={{
                  position: 'absolute',
                  bottom: 8,
                  left: 3,
                  borderRadius: '5vw',
                }}
              />
            )}
            {meetPerson.hasLovense && (
              <Image
                src={LovensePic}
                alt="Lovense"
                placeholder="empty"
                className={styles.lovense}
                priority={index < 3}
                width={20}
                height={20}
                style={{
                  position: 'absolute',
                  bottom: 0,
                  right: 0,
                }}
              />
            )}
          </div>
          {meetPerson.isNewUser && (
            <div className={styles.beginnerIcon}>
              <span>
                <Image
                  src={newUserPic}
                  alt="新人マーク"
                  style={{
                    width: '30px',
                    height: '30px',
                  }}
                />
              </span>
            </div>
          )}
        </a>
        <div className={styles.userStatus}>
          <div
            className={`${
              styles[determineOnlineStatusColor(meetPerson.lastLoginTime)]
            }`}
          />
          <div className={styles.username}>
            <span className={styles.age}>{meetPerson.age}</span>
            <span className={styles.sai}>歳</span>
            <span className={styles.region}>{meetPerson.region}</span>
          </div>
        </div>
        <div className={styles.call}>{meetPerson.last_action_status_label}</div>
      </li>
    );
  });
  return (
    <div className={styles.componentWrapper}>
      {showSwipeHint && (
        <div className={styles.swipeHintBubble}>
          横スクロールでユーザーを探せます！
        </div>
      )}
      <ul className={styles.container} ref={containerRef}>
        {showSwipeHint && (
          <Image
            src={swipeImg}
            alt="スワイプヒント"
            className={styles.swipeArrowIcon}
            width={60}
            height={60}
          />
        )}
        {items}
      </ul>
      {activeModal === 'twoshot' && activeModalData && (
        <VideoTwoModal
          partnerId={activeModalData.partnerId}
          userName={activeModalData.userName}
          age={activeModalData.age}
          region={activeModalData.region}
          avatarId={activeModalData.avatarId}
          about={''}
          onClose={closeChoiceModal}
          isPurchased={true}
          isBonusCourseExist={false}
          videoCallWaiting={activeModalData.videoCallWaiting}
          voiceCallWaiting={activeModalData.voiceCallWaiting}
        />
      )}
    </div>
  );
});

export default VideoChannelMeetPeople;
VideoChannelMeetPeople.displayName = 'VideoChannelMeetPeople';
