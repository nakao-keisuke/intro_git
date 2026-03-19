import { IconMessageCircle } from '@tabler/icons-react';
// Image component removed (use <img> directly);
import { useNavigate } from '@tanstack/react-router';
import { memo, useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import StreamPointShortageModal from '@/components/purchase/StreamPointShortageModal';
import { MIN_POINT_FOR_VIDEO_CHAT_VIEWING } from '@/constants/pricing';
import { useLiveUsers, useMyPoint } from '@/hooks/usePollingData';
import { usePurchaseCompletedReload } from '@/hooks/usePurchaseCompletedReload';
import { useCallStore } from '@/stores/callStore';
import { inCall } from '@/utils/callState';
import { getLiveErrorMessage, isChannelEndedMessage } from '@/utils/liveError';

const livePlayPIC = '/livePlay.webp';

type Props = {
  onJoinChannel: (() => Promise<void>) | undefined;
  partnerId: string;
  isLive?: boolean;
  forceEnded?: boolean;
  /** 配信者名 */
  userName: string;
  /** 配信者のアバターID */
  avatarId: string;
  /** 配信サムネイルID */
  thumbnailImageId?: string;
  /** 視聴者人数 */
  viewerCount?: number | undefined;
  /** 配信者の年齢 */
  age?: number | undefined;
  /** 配信者の地域 */
  region?: number | string | undefined;
  /** バストサイズ */
  bustSize?: string | undefined;
  /** ラブンス対応 */
  hasLovense?: boolean | undefined;
  /** RTM認証時にポイント不足と判定された */
  isPointShortage?: boolean;
};

export const FixedLiveChannelerButtonCard = memo<Props>(
  ({
    onJoinChannel,
    partnerId,
    isLive: isLiveProp,
    forceEnded = false,
    userName,
    avatarId,
    thumbnailImageId,
    viewerCount,
    age,
    region,
    bustSize,
    hasLovense,
    isPointShortage,
  }) => {
    const [loading, setLoading] = useState(false);
    const callState = useCallStore((s) => s.callState);
    const myPointData = useMyPoint();
    const myPoint: number | undefined = myPointData?.data?.point;
    const { data: liveUsersData, getLiveCallType } = useLiveUsers();
    const hasLiveUsersData = !!liveUsersData?.data;
    const isStatusUnknown = !hasLiveUsersData && !forceEnded;
    const isChannelEnded =
      forceEnded || (hasLiveUsersData && !getLiveCallType(partnerId));
    const wasChannelActive = useRef(!isChannelEnded); // 初回の配信状態を記録
    const channelEndToastShownRef = useRef(false); // 配信終了toastの重複防止
    const [notEnoughPointModalOpen, setNotEnoughPointModalOpen] =
      useState(false);
    const [error, setError] = useState<string | null>(null);
    const [buttonDisabled, setButtonDisabled] = useState(false);
    const [initTimedOut, setInitTimedOut] = useState(false);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const joinStartedRef = useRef(false); // 入室処理が開始されたかのフラグ

    const showChannelEndToast = () => {
      if (channelEndToastShownRef.current) return;
      channelEndToastShownRef.current = true;
      toast.info('この配信は終了しました');
    };

    // forceEnded または 配信中→配信終了に変わった瞬間（初回データ取得時の終了済み含む）にtoastを表示
    useEffect(() => {
      if (forceEnded) {
        showChannelEndToast();
        return;
      }
      if (!hasLiveUsersData) return;
      if (isChannelEnded && wasChannelActive.current) {
        showChannelEndToast();
      }
      wasChannelActive.current = !isChannelEnded;
    }, [isChannelEnded, hasLiveUsersData, forceEnded]);

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
      }
    }, [callState]);

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
          showChannelEndToast();
        }
      }, 5000); // 5秒のタイムアウト
    };

    const handleJoin = async () => {
      // チャンネル存在チェック（ポーリングデータで配信終了を事前検知）
      if (forceEnded || (hasLiveUsersData && !getLiveCallType(partnerId))) {
        showChannelEndToast();
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
          throw new Error('入室処理に失敗しました(onJoinChannel未定義)');
        }
      } catch (err) {
        const errorMsg = getLiveErrorMessage(err);
        if (isChannelEndedMessage(errorMsg)) {
          console.info('配信終了:', err);
          showChannelEndToast();
        } else {
          console.error('入室処理エラー:', err);
          setError(errorMsg);
        }
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

    // ネイティブアプリからの購入完了イベントを監視（Renka経由の課金）
    usePurchaseCompletedReload(isPointShortage ?? false);

    // RTM初期化が10秒以内に完了しない場合、ボタンテキストを切り替え
    useEffect(() => {
      if (onJoinChannel) return;

      const timeout = setTimeout(() => {
        setInitTimedOut(true);
      }, 10_000);

      return () => clearTimeout(timeout);
    }, [onJoinChannel]);

    const router = useRouter();
    const navigateToChat = () => {
      router.push(`/message/${partnerId}`);
    };

    const onClick = () => {
      if (buttonDisabled) return; // ボタンが無効化されている場合は何もしない
      // ポイント不足の場合はモーダルを表示
      if (isPointShortage) {
        setNotEnoughPointModalOpen(true);
        return;
      }
      if (!onJoinChannel) return; // RTM未初期化なら何もしない
      if (myPoint === undefined) return;
      if (myPoint < MIN_POINT_FOR_VIDEO_CHAT_VIEWING) {
        setNotEnoughPointModalOpen(true);
        return;
      }
      handleJoin();
    };

    const getButtonText = (): string | null => {
      if (loading) return '入室処理中...';
      if (error) return 'エラーが発生しました';
      if (forceEnded) return 'この配信は終了しました';
      if (isStatusUnknown) return '接続準備中...';
      if (isChannelEnded) return 'この配信は終了しました';
      if (isPointShortage) return 'チャージして視聴する';
      if (!onJoinChannel)
        return initTimedOut ? '接続に失敗しました' : '接続準備中...';
      return null;
    };

    return (
      <div className="fixed right-0 bottom-0 left-0 z-[1000] mb-6 flex justify-center md:mb-8">
        <div className="mx-0 mt-0 mb-0 ml-[10px] flex gap-[8px] rounded-t-3xl px-4 pb-1 md:ml-0 md:gap-8 md:pt-4">
          <button
            className={`group relative flex h-16 w-64 cursor-pointer flex-col items-center justify-center gap-0 overflow-hidden rounded-full ${
              isChannelEnded
                ? 'bg-gray-400 shadow-none'
                : isLiveProp
                  ? 'bg-gradient-to-br from-pink-300 to-pink-500 shadow-[0_0_25px_rgba(236,72,153,0.6)] transition-shadow duration-300 hover:shadow-[0_0_40px_rgba(236,72,153,0.9)] hover:brightness-110'
                  : 'bg-gradient-to-br from-cyan-300 to-cyan-500 shadow-[0_0_25px_rgba(6,182,212,0.6)] transition-shadow duration-300 hover:shadow-[0_0_40px_rgba(6,182,212,0.9)] hover:brightness-110'
            } ${loading || buttonDisabled || (!onJoinChannel && !isPointShortage) || isChannelEnded || isStatusUnknown || forceEnded ? 'pointer-events-none opacity-60' : 'animate-pulse-scale'}`}
            onClick={onClick}
          >
            {/* スケルトン光沢エフェクト */}
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute inset-0 animate-shimmer bg-gradient-to-r from-transparent via-white/40 to-transparent" />
            </div>
            <div className="flex items-center justify-center gap-3">
              <Image
                src={livePlayPIC}
                width={40}
                height={40}
                alt="ライブ配信アイコン"
                className="translate-y-1 transition-transform duration-300 group-hover:scale-110"
              />
              <span className="translate-y-1 font-bold text-lg text-white leading-none">
                {getButtonText() ||
                  (isLiveProp
                    ? 'ビデオチャット配信中'
                    : 'ビデオチャット待機中')}
              </span>
            </div>
            {!getButtonText() && (
              <span className="mt-0.5 text-[16px] text-white">視聴する</span>
            )}
          </button>
          <button
            className="group relative flex h-16 w-16 cursor-pointer flex-col items-center justify-center gap-0 rounded-full bg-gradient-to-br from-yellow-300 to-yellow-500 shadow-[6px_6px_16px_rgba(0,0,0,0.35)] transition-all duration-150 hover:shadow-[4px_4px_12px_rgba(0,0,0,0.4)] active:shadow-[2px_2px_8px_rgba(0,0,0,0.25)]"
            onClick={navigateToChat}
          >
            <IconMessageCircle
              size={30}
              color="white"
              fill="white"
              strokeWidth={1.5}
              className="transition-transform duration-300 group-hover:scale-110"
            />
            <span className="font-bold text-[10px] text-white leading-none">
              メッセージ
            </span>
          </button>
        </div>
        {error && (
          <div className="fixed bottom-[140px] left-1/2 z-[1000] max-w-[90%] -translate-x-1/2 rounded-lg bg-[#ff4444] px-4 py-3 text-center text-sm text-white shadow-[0_2px_10px_rgba(0,0,0,0.2)] md:bottom-[180px]">
            {error}
          </div>
        )}
        {notEnoughPointModalOpen && (
          <StreamPointShortageModal
            onClose={() => setNotEnoughPointModalOpen(false)}
            onPurchaseAndWatch={() => {
              if (isPointShortage) {
                window.location.reload();
                return;
              }
              setNotEnoughPointModalOpen(false);
              handleJoin();
            }}
            userName={userName}
            avatarId={avatarId}
            thumbnailImageId={thumbnailImageId}
            viewerCount={viewerCount}
            age={age}
            region={region}
            bustSize={bustSize}
            hasLovense={hasLovense}
          />
        )}
      </div>
    );
  },
);

FixedLiveChannelerButtonCard.displayName = 'FixedCallButtonCard';
