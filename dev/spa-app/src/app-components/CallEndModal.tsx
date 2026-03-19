// Image component removed (use <img> directly);
import { useNavigate } from '@tanstack/react-router';
import { useSession } from '#/hooks/useSession';
import { memo, useEffect, useState } from 'react';
import CallPointShortageModal from '@/components/purchase/CallPointShortageModal';
import StreamPointShortageModal from '@/components/purchase/StreamPointShortageModal';
import { ReviewModal } from '@/components/ReviewModal';
import RoundedThumbnail from '@/components/RoundedThumbnail';
import { GET_USER_INF_FOR_WEB_WITH_USER_ID } from '@/constants/endpoints';

import { useBookmark } from '@/hooks/useBookmark';
import { useCallEndModal } from '@/hooks/useCallEndModal';
import { useNavigateWithOrigin } from '@/hooks/useNavigateWithOrigin';
import { useRequest } from '@/hooks/useRequest';
import styles from '@/styles/CallEndedModal.module.css';
import {
  getLiveChannelerProfilePath,
  type LiveCallType,
} from '@/utils/callView';
import { postToNext } from '@/utils/next';
import { isMobileUserAgent } from '@/utils/userAgent';

const CallEndModal = memo(() => {
  const _nav = useNavigateWithOrigin();
  const router = useRouter();
  const [
    callEndedMessage,
    actionButtonType,
    callEndedType,
    isCallEndedModalOpen,
    partnerId,
    closeModal,
    callDurationSec,
    callType,
  ] = useCallEndModal();

  const [userName, setUserName] = useState('');
  const [avatarId, setAvatarId] = useState('');
  const [initialBookmark, setInitialBookmark] = useState(false);
  const [sendingRequest, setSendingRequest] = useState(false);
  const [showRequestSent, setShowRequestSent] = useState(false);
  const [showPointShortageModal, setShowPointShortageModal] = useState(false);
  const { data: session } = useSession();
  const token = session?.user.token;
  const myId = session?.user.id;

  const { requestCall } = useRequest();

  const {
    isBookmarked: isBookmarkedState,
    addBookmark,
    removeBookmark,
  } = useBookmark(partnerId || '', initialBookmark, myId);

  // modalState: 'none' | 'review' | 'callEnded'
  const [modalState, setModalState] = useState<'none' | 'review' | 'callEnded'>(
    'none',
  );

  useEffect(() => {
    if (isCallEndedModalOpen) {
      if (callDurationSec !== undefined && callDurationSec >= 60) {
        setModalState('review');
      } else {
        setModalState('callEnded');
      }
    } else {
      setModalState('none');
    }
  }, [isCallEndedModalOpen, callDurationSec]);

  useEffect(() => {
    const getUserInfo = async () => {
      if (!partnerId || !myId) return;
      try {
        const response = await postToNext<{
          userName: string;
          avatarId: string;
          bookmark: boolean;
        }>(GET_USER_INF_FOR_WEB_WITH_USER_ID, { myId, partnerId });

        if (response.type === 'error') {
          throw new Error(response.message);
        }
        setUserName(response.userName);
        setAvatarId(response.avatarId);
        setInitialBookmark(response.bookmark);
      } catch (_error) {
        alert('ユーザー情報の取得に失敗しました。');
      }
    };
    getUserInfo();
  }, [myId, partnerId]);

  const onClickPurchase = () => {
    setShowPointShortageModal(true);
  };

  const onClickChat = () => {
    if (!partnerId) return;
    router.push(`/message/${partnerId}`);
    closeModal(true);
    setModalState('none');
  };

  // 通話リクエスト送信
  const handleSendCallRequest = async () => {
    if (sendingRequest || !partnerId) return;
    setSendingRequest(true);
    const isVideo =
      callType === 'videoCallFromOutgoing' ||
      callType === 'videoChatFromOutgoing';
    const mapped = isVideo ? 'videoCallFromOutgoing' : 'voiceCallFromOutgoing';
    const result = await requestCall(partnerId, mapped);
    if (!result.success) {
      alert(result.error);
      setSendingRequest(false);
      return;
    }
    setShowRequestSent(true);
  };

  // リクエスト送信完了後のOKボタン
  const handleRequestSentOk = () => {
    setShowRequestSent(false);
    closeModal(true);
    setModalState('none');
  };

  const onClosed = (event: React.MouseEvent) => {
    if (event.target === event.currentTarget) {
      closeModal(true);
      setModalState('none');
    }
  };

  const handleCloseButton = () => {
    closeModal(true);
    setModalState('none');
  };

  /* ミッションバナーをクリックした場合の処理 */
  const _onClickMissionBanner = () => {
    const baseUrl =
      'https://web2.marrytalk-mobile-app.com/news/male/making_call_mission';
    const url = token ? `${baseUrl}?sid=${token}` : baseUrl;
    window.location.href = url;
  };

  const handleProfileClick = () => {
    if (!partnerId) return;

    const userAgent =
      typeof window !== 'undefined' ? window.navigator.userAgent : '';
    const isPC = !isMobileUserAgent(userAgent);

    let profilePath = '/profile/unbroadcaster';

    if (callType && ['videoCallFromStandby', 'live'].includes(callType)) {
      profilePath = getLiveChannelerProfilePath(callType as LiveCallType);
    } else {
      profilePath = isPC
        ? '/profile/unbroadcaster/pc'
        : '/profile/unbroadcaster';
    }

    router.push(`${profilePath}/${partnerId}`);
    closeModal(true);
    setModalState('none');
  };

  if (modalState === 'none') return null;

  return (
    <>
      {modalState === 'review' && partnerId && (
        <ReviewModal
          targetUserId={partnerId}
          isOpen={modalState === 'review'}
          onClose={() => {
            setModalState('callEnded');
          }}
          source="call_end"
        />
      )}
      {modalState === 'callEnded' && isCallEndedModalOpen && (
        <div className={styles.overlay} onClick={onClosed}>
          <div className={styles.modal}>
            <button
              type="button"
              onClick={handleCloseButton}
              className={styles.close}
            >
              ×
            </button>
            {(callEndedType === 'pointless' || callEndedType === 'error') && (
              <h3 className={styles.title}>ポイントが不足しています</h3>
            )}
            <div className={styles.message}>{callEndedMessage}</div>
            <div className={styles.partner}>
              <div className={styles.thumbnail}>
                <RoundedThumbnail
                  avatarId={avatarId}
                  deviceCategory="mobile"
                  customSize={{ width: 60, height: 60 }}
                  onClick={handleProfileClick}
                />
              </div>
              <div className={styles.name}>{userName}さん</div>
              <div className={styles.bookmark_container}>
                <div
                  className={styles.bookmark}
                  onClick={isBookmarkedState ? removeBookmark : addBookmark}
                >
                  <Image
                    src={
                      isBookmarkedState
                        ? '/after_fav_icon.webp'
                        : '/before_fav_icon.webp'
                    }
                    alt={
                      isBookmarkedState ? 'お気に入り済み' : 'お気に入りする'
                    }
                    width={30}
                    height={30}
                    className="cursor-pointer"
                  />
                  <p className={styles.bookmark_text}>お気に入り</p>
                </div>
              </div>
            </div>
            <div className={styles.btn_container}>
              {actionButtonType === 'chat' && (
                <>
                  {/* 通話リクエストボタン */}
                  {callType && (
                    <button
                      type="button"
                      onClick={handleSendCallRequest}
                      disabled={sendingRequest}
                      className={
                        callType === 'voiceCall'
                          ? 'rounded-full bg-[#4794ff] px-4 py-2 text-center font-bold text-white shadow-[0_3px_0_#1c64c8] drop-shadow-[1px_1px_2px_rgba(81,81,81,0.28)] transition-all duration-300 ease-out [text-shadow:0_0_2px_rgba(22,22,22,0.122)] hover:translate-y-[3px] hover:shadow-none'
                          : 'rounded-full bg-[linear-gradient(to_top,#df4343,#f95757_40%)] px-4 py-2 text-center font-bold text-white shadow-[0_3px_0_#bd3c3c] drop-shadow-[1px_1px_2px_rgba(81,81,81,0.28)] transition-all duration-300 ease-out [text-shadow:0_0_2px_rgba(22,22,22,0.122)] hover:translate-y-[3px] hover:shadow-none'
                      }
                    >
                      <div className="whitespace-nowrap text-[13px]">
                        {callType === 'voiceCall'
                          ? '音声通話リクエスト'
                          : 'ビデオ通話リクエスト'}
                      </div>
                      <div className="whitespace-nowrap text-[11px]">
                        (無料)
                      </div>
                    </button>
                  )}

                  {/* 通常版（デフォルト） */}
                  <button
                    type="button"
                    onClick={onClickChat}
                    className={styles.chat}
                  >
                    <div>
                      <Image
                        src="/bottom_navigation.icon/bottom_mail.webp"
                        alt="メール"
                        width={25}
                        height={25}
                        className="cursor-pointer"
                      />
                      {userName}さんにメッセージを送る
                    </div>
                  </button>

                  {/* ミッションバナー版（使うときはこのブロックのコメントを外してください） */}
                  {/* {callType && !isNativeApplication() && (
                    <div
                      className="cursor-pointer w-full"
                      onClick={_onClickMissionBanner}
                    >
                      <p className="mb-2 text-center text-sm font-medium text-pink-500">
                        ▼ミッションに参加してポイントをGet▼
                      </p>
                      <Image
                        src="/banner/male_call_mission_0123_h.webp"
                        alt="callMissionBanner"
                        width={400}
                        height={200}
                        className="w-full h-auto"
                        priority={false}
                      />
                    </div>
                  )} */}
                  {/* ミッションバナーここまで */}
                </>
              )}
              {actionButtonType === 'purchase' && (
                <button
                  type="button"
                  onClick={onClickPurchase}
                  className={styles.purchase}
                >
                  <div>
                    <Image
                      src="/bottom_navigation.icon/bottom_p.webp"
                      alt="ポイント"
                      width={25}
                      height={25}
                      className="cursor-pointer"
                    />
                    ポイントをチャージする
                  </div>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* リクエスト送信完了モーダル */}
      {showRequestSent && (
        <div
          className="fixed inset-0 z-[99999] flex items-center justify-center bg-[rgba(39,39,39,0.5)]"
          onClick={handleRequestSentOk}
        >
          <div className="w-[60%] animate-[popup_0.3s_cubic-bezier(0.22,1,0.36,1)_forwards] rounded-[2vh] bg-white p-4 text-[#3f3646] text-[13px]">
            通話リクエストを送信しました
            <br />
            返事が来たら、こちらから発信しましょう♪
            <br />
            <div className="mt-3 flex justify-center">
              <button
                onClick={handleRequestSentOk}
                className="mt-4 rounded-full bg-[linear-gradient(to_top,#2bb1de,#44c2eb_60%)] px-4 py-2 font-bold text-[15px] text-white shadow-[0_1px_2px_rgba(0,0,0,0.2)]"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ポイント不足モーダル */}
      {showPointShortageModal &&
        partnerId &&
        (callType === 'live' || callType === 'sideWatch' ? (
          <StreamPointShortageModal
            onClose={() => {
              setShowPointShortageModal(false);
            }}
            onPurchaseAndWatch={() => {
              setShowPointShortageModal(false);
            }}
            userName={userName}
            avatarId={avatarId}
          />
        ) : (
          <CallPointShortageModal
            onClose={() => {
              setShowPointShortageModal(false);
            }}
            onPurchaseAndCall={() => {
              setShowPointShortageModal(false);
            }}
            callType="both"
            partnerId={partnerId}
            userName={userName}
            avatarId={avatarId}
          />
        ))}
    </>
  );
});

CallEndModal.displayName = 'CallEndModal';

export default CallEndModal;
