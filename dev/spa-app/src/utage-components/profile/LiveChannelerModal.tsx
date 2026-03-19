// Image component removed (use <img> directly);
import { useNavigate } from '@tanstack/react-router';
import { useEffect, useRef, useState } from 'react';
import { BeatLoader } from 'react-spinners';
import AppPayNoModal from '@/app/components/AppPayNoModal';
import { useLiveUsers, useMyPoint } from '@/hooks/usePollingData';
import { useCallStore } from '@/stores/callStore';
import type { LiveChannel } from '@/types/LiveChannel';
import { inCall } from '@/utils/callState';
import type { LiveCallView } from '@/utils/callView';
import { imageUrl, imageUrlForAgoraScreenshot } from '@/utils/image';
import { getLiveErrorMessage, isChannelEndedMessage } from '@/utils/liveError';

type LiveChannelerModalProps = {
  isOpen: boolean;
  onClose: () => void;
  liveChannel: LiveChannel;
  liveCallView: LiveCallView;
  onJoinChannel: (() => Promise<void>) | undefined;
};

export const LiveChannelerModal: React.FC<LiveChannelerModalProps> = ({
  isOpen,
  onClose,
  liveChannel,
  liveCallView,
  onJoinChannel,
}) => {
  const { broadcaster, channelInfo } = liveChannel;
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const callState = useCallStore((s) => s.callState);
  const myPointData = useMyPoint();
  const myPoint: number | undefined = myPointData?.data?.point;
  const { getLiveCallType } = useLiveUsers();
  const [notEnoughPointModalOpen, setNotEnoughPointModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [buttonDisabled, setButtonDisabled] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const joinStartedRef = useRef(false); // 入室処理が開始されたかのフラグ

  // callStateの変更を監視
  useEffect(() => {
    if (callState === inCall && joinStartedRef.current) {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      setLoading(false);
      setButtonDisabled(false);
      joinStartedRef.current = false;
      onClose(); // モーダルを閉じる
    }
  }, [callState, onClose]);

  const startJoinTimeout = () => {
    // 以前のタイマーがあれば消去
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    // 5秒経過しても入室できなかった場合はエラーを表示
    timerRef.current = setTimeout(() => {
      if (joinStartedRef.current) {
        setLoading(false);
        setButtonDisabled(false);
        joinStartedRef.current = false;
        setError('この配信は終了しました');
      }
    }, 5000); // 5秒のタイムアウト
  };

  const handleJoin = async () => {
    // チャンネル存在チェック（ポーリングデータで配信終了を事前検知）
    if (!getLiveCallType(broadcaster.userId)) {
      setError('この配信は終了しました');
      setLoading(false);
      setButtonDisabled(false);
      return;
    }

    setLoading(true);
    setButtonDisabled(true);
    setError(null);
    joinStartedRef.current = true; // 入室処理開始フラグを立てる

    try {
      // タイムアウト処理を開始
      startJoinTimeout();

      if (onJoinChannel) {
        await onJoinChannel();

        // ここでcallStateがすぐに変わらない場合、タイマーが処理する
        // タイムアウト処理はuseEffectで監視
      } else {
        throw new Error('入室処理に失敗しました（onJoinChannel未定義）');
      }
    } catch (err) {
      const errorMsg = getLiveErrorMessage(err);
      if (isChannelEndedMessage(errorMsg)) {
        console.info('配信終了:', err);
      } else {
        console.error('入室処理エラー:', err);
      }
      setError(errorMsg);
      setLoading(false);
      setButtonDisabled(false);
      joinStartedRef.current = false;

      // タイムアウト処理をクリア
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  // コンポーネントのアンマウント時にタイマーをクリーンアップ
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      joinStartedRef.current = false;
    };
  }, []);

  const isVideoCall = liveCallView.type === 'videoCallFromStandby';
  const isLive = liveCallView.type === 'live';

  const liveIcon = () => {
    if (isVideoCall) {
      return (
        <Image
          src={'/situation.icon/twoshot.webp'}
          alt="video"
          width={145}
          height={45}
        />
      );
    } else {
      return (
        <Image
          src={'/situation.icon/videochat.webp'}
          alt="live"
          width={145}
          height={45}
        />
      );
    }
  };

  const LiveTitle = () => {
    if (isVideoCall) {
      return 'ビデオ通話待機中';
    } else if (isLive) {
      // broadcaster.isLiveで判定（girls/live-listと同じロジック）
      return liveChannel.broadcaster?.isLive
        ? 'ビデオチャット配信中'
        : 'ビデオチャット待機中';
    }
    return null;
  };

  const onClick = () => {
    if (buttonDisabled) return; // ボタンが無効化されている場合は何もしない

    // ポイントチェック - ボタンクリック時に実行
    if (myPoint === undefined) return;
    if (myPoint < 200) {
      setNotEnoughPointModalOpen(true);
      return;
    }

    // onJoinChannelがない場合でもポイント十分なら何もしない（準備中）
    if (!onJoinChannel) return;

    handleJoin();
  };

  const handleClickOutside = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleGoBack = () => {
    setError(null);
    router.push('/girls/all');
  };

  if (!isOpen) {
    return null;
  }

  // 配信中の場合はスクリーンショット、それ以外はアバター画像を表示
  const avatarImageUrl = imageUrl(broadcaster.avatarId);
  const backgroundImageUrl =
    broadcaster.isLive && channelInfo.thumbnailImageId
      ? imageUrlForAgoraScreenshot(channelInfo.thumbnailImageId)
      : avatarImageUrl;

  return (
    <>
      <div
        className="fixed top-0 left-0 z-[1000] flex h-full w-full items-center justify-center bg-black/60"
        onClick={handleClickOutside}
      >
        <div className="flex max-h-[80vh] w-[90%] max-w-[400px] animate-[popup_0.3s_cubic-bezier(0.22,1,0.36,1)_forwards] flex-col items-center rounded-[10px] bg-white md:relative md:h-[500px] md:max-h-[500px] md:max-w-[800px]">
          <style jsx>{`
            @keyframes popup {
              0% {
                transform: translateY(40px) scale(0.8);
                opacity: 0;
              }
              80%, 100% {
                opacity: 1;
              }
              100% {
                transform: translateY(0) scale(1);
              }
            }
            @keyframes shine {
              from {
                left: -100%;
              }
              to {
                left: 100%;
              }
            }
            @keyframes tenmetu {
              0% {
                opacity: 0;
              }
              100% {
                opacity: 1;
              }
            }
            @keyframes errorShake {
              0%, 100% {
                margin-left: 0;
              }
              10%, 30%, 50%, 70%, 90% {
                margin-left: -5px;
              }
              20%, 40%, 60%, 80% {
                margin-left: 5px;
              }
            }
          `}</style>

          <button
            className="absolute top-[5px] right-[5px] z-[1000] flex h-[30px] w-[30px] cursor-pointer items-center justify-center rounded-full border border-gray-100 text-[2rem] text-gray-100"
            onClick={onClose}
          >
            ×
          </button>

          <div className="relative h-[500px] w-full overflow-hidden blur-sm md:h-full md:rounded-[10px]">
            <Image
              src={backgroundImageUrl}
              alt="ユーザー画像"
              placeholder="empty"
              quality={100}
              priority={true}
              fill
              style={{
                objectFit: 'cover',
                width: '100%',
                height: '100%',
                borderRadius: '10px',
              }}
            />
            <div className="absolute top-0 left-0 z-[100] h-full w-full bg-[rgba(17,17,17,0.235)]" />
          </div>

          {!isVideoCall && (
            <div className="absolute top-[10px] left-[10px] z-10 flex items-center justify-center overflow-hidden rounded-[3px] border border-[rgba(47,47,47,0.34)] bg-[#e71939] px-2 font-bold text-[13px] text-white shadow-[0_0_5px_rgba(69,69,69,0.37)]">
              <span className="mr-0.5 animate-[tenmetu_0.8s_ease-in-out_infinite_alternate] text-lg">
                ●
              </span>
              LIVE
            </div>
          )}

          {liveCallView.type === 'live' && (
            <div className="absolute top-[70%] mt-2.5 -translate-y-1/2 rounded-[20px] bg-white/70 px-[15px] py-2 font-normal text-[0.8rem] text-black shadow-[0_2px_4px_rgba(0,0,0,0.2)] after:absolute after:-top-2 after:left-1/2 after:-translate-x-1/2 after:border-r-[8px] after:border-r-transparent after:border-b-[8px] after:border-b-white/70 after:border-l-[8px] after:border-l-transparent after:content-[''] md:left-1/2 md:-translate-x-1/2">
              コメント無料！
            </div>
          )}

          <div className="absolute top-[25%] mt-2.5 -translate-y-1/2 text-center font-normal text-[1.2rem] text-gray-100 md:top-[30%] md:left-1/2 md:w-4/5 md:-translate-x-1/2">
            <div className="mx-auto mb-2.5 flex items-center justify-center">
              {liveIcon()}
            </div>
            {broadcaster.userName}さんは
            <br />
            <span className="font-bold">{LiveTitle()}</span>
            です
          </div>

          {loading && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
              <BeatLoader color="#00bfff" size={15} />
            </div>
          )}

          {error ? (
            <>
              <div className="absolute top-[40%] left-1/2 my-2.5 w-4/5 -translate-x-1/2 animate-[errorShake_0.5s_ease-in-out] whitespace-pre-line rounded border border-[#ffdddd] bg-white px-4 py-2 text-center text-[#e71939] text-sm shadow-[0_2px_4px_rgba(0,0,0,0.1)] md:w-3/5">
                {error}
              </div>
              <div className="absolute top-[60%] left-1/2 flex w-4/5 -translate-x-1/2 justify-center gap-2.5 md:w-3/5">
                <button
                  className="flex cursor-pointer items-center justify-center rounded-[50px] border border-[#ddd] border-white/90 bg-white/80 px-[30px] py-2.5 text-center font-bold text-[#333] hover:opacity-90"
                  onClick={handleGoBack}
                >
                  戻る
                </button>
              </div>
            </>
          ) : (
            <button
              className={`absolute top-[60%] flex w-[70%] -translate-y-1/2 items-center justify-center overflow-hidden rounded-[25px] border border-white/90 bg-gradient-to-br from-[#5010d2] via-[#ef3275] to-[#ffd480] px-5 py-2.5 text-center font-bold text-white hover:opacity-90 md:left-1/2 md:w-1/2 md:-translate-x-1/2 ${
                buttonDisabled ||
                (myPoint === undefined || (myPoint >= 200 && !onJoinChannel))
                  ? 'cursor-not-allowed bg-gradient-to-br from-[#7d7d7d] to-[#a5a5a5] opacity-50'
                  : ''
              } ${
                !(
                  buttonDisabled ||
                    myPoint === undefined ||
                    (myPoint >= 200 && !onJoinChannel)
                )
                  ? 'before:absolute before:top-0 before:left-0 before:h-full before:w-[90%] before:animate-[shine_2s_infinite_ease-in-out] before:bg-gradient-to-r before:from-transparent before:via-white/30 before:to-transparent before:content-[""]'
                  : ''
              }`}
              onClick={onClick}
            >
              {loading
                ? '入室処理中...'
                : myPoint === undefined || (myPoint >= 200 && !onJoinChannel)
                  ? '配信を準備しています...'
                  : '入室する'}
              {broadcaster.hasLovense && (
                <div className="ml-[5px]">
                  <Image
                    src={'/lovense.webp'}
                    alt="lovense"
                    width={30}
                    height={30}
                  />
                </div>
              )}
            </button>
          )}
        </div>
      </div>
      {notEnoughPointModalOpen && (
        <AppPayNoModal onClose={() => setNotEnoughPointModalOpen(false)} />
      )}
    </>
  );
};

LiveChannelerModal.displayName = 'LiveChannelerModal';

export default LiveChannelerModal;
