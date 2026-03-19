// Image component removed (use <img> directly);
import { usePathname, useRouter } from '@tanstack/react-router';
// TODO: i18n - import { useTranslations } from '#/i18n';
import type React from 'react';
import { useEffect, useRef, useState } from 'react';
import { cssTransition, ToastContainer, toast, Zoom } from 'react-toastify';
import { isNativeApplication } from '@/constants/applicationId';
import { native } from '@/libs/nativeBridge';
import { useCallStore } from '@/stores/callStore';
import { usePollingStore } from '@/stores/pollingStore';
import { useUIStore } from '@/stores/uiStore';
import { inCall } from '@/utils/callState';
import { getCookie, setCookie } from '@/utils/clientCookie';
import { imageUrl } from '@/utils/image';

// 通知済みIDキャッシュの最大サイズ（メモリリーク防止）
const MAX_NOTIFIED_IDS_CACHE_SIZE = 100;

// Cookie内の通知済みIDの最大保持件数（Cookie肥大化防止）
const MAX_NOTIFIED_COOKIE_SIZE = 100;

// PC用のカスタムトランジション（右からスライド）
const slideRight = cssTransition({
  enter: 'animate-toast-slide-in-right',
  exit: 'animate-toast-slide-out-right',
  appendPosition: false,
});

// Toast共通設定（positionは個別に指定）
const commonToastContainerProps = {
  autoClose: 3700,
  hideProgressBar: true,
  closeOnClick: true,
  closeButton: false,
  newestOnTop: false,
  draggable: true,
  pauseOnHover: false,
  pauseOnFocusLoss: false,
  limit: 1,
  theme: 'light' as const,
};

// Toastメッセージコンテンツコンポーネント
interface ToastMessageProps {
  lastMessage: string;
  imageId?: string | null | undefined;
  videoId?: string | null | undefined;
  chatId: string;
}

const ToastMessage: React.FC<ToastMessageProps> = ({
  lastMessage,
  imageId,
  videoId,
  chatId,
}) => {
  const t = useTranslations('common');
  return (
    <div className="m-0 line-clamp-2 overflow-hidden break-words text-[0.9rem] leading-tight">
      {imageId || videoId ? (
        <div
          className="flex w-full items-center justify-between gap-2"
          id={`image-container-${chatId}`}
        >
          <span className="line-clamp-2 flex-1 overflow-hidden break-words">
            {lastMessage}
          </span>
          <Image
            src={imageUrl(videoId || imageId || '')}
            alt={videoId ? t('receivedVideo') : t('receivedImage')}
            width={40}
            height={40}
            className="ml-2 h-10 w-10 flex-shrink-0 rounded-md object-cover"
            onError={() => {
              const container = document.getElementById(
                `image-container-${chatId}`,
              );
              if (container) container.style.display = 'none';
            }}
          />
        </div>
      ) : (
        lastMessage
      )}
    </div>
  );
};

const AppToast = () => {
  const router = useRouter();
  const pathname = usePathname();

  // Zustand storeで通知設定を管理（localStorageと自動同期）
  const isNotification = usePollingStore((s) => s.enableAppToast);
  const setIsNotification = usePollingStore((s) => s.setEnableAppToast);

  const newChatData = usePollingStore((s) => s.utagePolling);
  const toastQueue = usePollingStore((s) => s.utageToastQueue);
  const addToToastQueue = usePollingStore((s) => s.addToToastQueue);
  const removeFromToastQueue = usePollingStore((s) => s.removeFromToastQueue);
  const setLatestTimeStamp = usePollingStore(
    (s) => s.setUtagePollingLatestTimeStamp,
  );
  const callState = useCallStore((s) => s.callState);
  const isInCall = callState === inCall;

  const isPC = useUIStore((s) => s.isPC);
  const [isEmbedded, setIsEmbedded] = useState(false);
  const notifiedIdsRef = useRef<Set<string>>(new Set());

  // クライアントサイドで埋め込みモードを検出
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      setIsEmbedded(params.get('embedded') === 'true');
    }
  }, []);

  // ネイティブ通知権限をチェックしてトースト表示を制御
  // grantedの場合のみ強制的にOFF（ネイティブ通知があるので不要）
  // denied/undeterminedの場合はユーザーの設定を尊重
  // マウント時 + 端末設定から戻ってきた時に再チェック
  useEffect(() => {
    const checkNativeNotificationPermission = async () => {
      if (!isNativeApplication() || !native.isInWebView()) return;

      try {
        const { result } = await native.checkPermission('notification');
        // grantedの場合のみ強制的にトーストOFF
        // denied/undeterminedの場合はユーザーの設定を尊重（上書きしない）
        if (result?.status === 'granted') {
          setIsNotification(false);
        }
      } catch (error) {
        console.error('Failed to check notification permission:', error);
      }
    };

    // 初回チェック
    checkNativeNotificationPermission();

    // 端末設定から戻ってきた時に再チェック
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkNativeNotificationPermission();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () =>
      document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [setIsNotification]);

  useEffect(() => {
    const newMessages = newChatData?.data;
    if (!isNotification || !newMessages || newMessages.length === 0) return;

    const notifiedChatsFromCookie: string[] = JSON.parse(
      getCookie('notifiedChats') || '[]',
    );

    const trulyNewMessages = newMessages.filter((newChat) => {
      // 1. 同期キャッシュチェック
      if (notifiedIdsRef.current.has(newChat.id)) return false;
      // 2. Cookieチェック
      if (notifiedChatsFromCookie.includes(newChat.id)) return false;
      // 3. 現在表示中の画面チェック
      const isOnMessagePage = pathname?.includes(
        `/message/${newChat.partnerId}`,
      );
      const isOnConversationWithUser =
        pathname?.includes('/conversation') &&
        pathname?.includes(`userId=${newChat.partnerId}`);
      return !isOnMessagePage && !isOnConversationWithUser;
    });

    if (trulyNewMessages.length > 0) {
      // 新しいメッセージをキューに追加
      for (const chat of trulyNewMessages) addToToastQueue(chat);

      // 通知済みIDをキャッシュとCookieに保存
      const newNotifiedIds = trulyNewMessages.map((chat) => chat.id);
      for (const id of newNotifiedIds) notifiedIdsRef.current.add(id);
      if (notifiedIdsRef.current.size > MAX_NOTIFIED_IDS_CACHE_SIZE) {
        notifiedIdsRef.current.clear();
        for (const id of newNotifiedIds) notifiedIdsRef.current.add(id);
      }
      const merged = [...notifiedChatsFromCookie, ...newNotifiedIds];
      // Cookie肥大化防止: 古いエントリを削除して最新のMAX_NOTIFIED_COOKIE_SIZE件のみ保持
      const trimmed =
        merged.length > MAX_NOTIFIED_COOKIE_SIZE
          ? merged.slice(-MAX_NOTIFIED_COOKIE_SIZE)
          : merged;
      setCookie('notifiedChats', JSON.stringify(trimmed));

      // 最新のタイムスタンプを更新
      const latestTime = trulyNewMessages.reduce((latest, current) => {
        return current.timeStamp > latest ? current.timeStamp : latest;
      }, '');
      if (latestTime) {
        setLatestTimeStamp(latestTime);
      }
    }
  }, [
    newChatData,
    isNotification,
    pathname,
    addToToastQueue,
    setLatestTimeStamp,
  ]);

  const [isToastActive, setIsToastActive] = useState(false);
  useEffect(() => {
    // 通話中はトースト表示を停止（キューは保持）
    if (isInCall) return;

    if (toastQueue.length > 0 && !isToastActive) {
      const messageToShow = toastQueue[0];

      if (!messageToShow) {
        return;
      }

      setIsToastActive(true);

      const toastOptions = {
        theme: 'light' as const,
        autoClose: 3700,
        closeOnClick: true,
        draggable: true,
        draggablePercent: 30,
        draggableDirection: isPC ? ('x' as const) : ('y' as const),
        onClick: () => {
          const targetUrl = isPC
            ? `/conversation?userId=${messageToShow.partnerId}`
            : `/message/${messageToShow.partnerId}?from=${encodeURIComponent(pathname || '/conversation')}`;
          router.push(targetUrl);
        },
        className:
          'toast-custom min-h-[24px] px-2 py-1.5 transition-none cursor-pointer',
        icon: () => (
          <div className="h-11 w-11 flex-shrink-0">
            <Image
              src={imageUrl(messageToShow.avatarId)}
              alt="Avatar"
              width={56}
              height={56}
              className="h-full w-full rounded-full object-cover"
              onError={(e) => {
                const target = e.currentTarget as HTMLImageElement;
                target.src = '/images/default-avatar.png';
              }}
            />
          </div>
        ),
        onClose: () => {
          removeFromToastQueue();
          setIsToastActive(false);
        },
      };

      toast(
        <ToastMessage
          lastMessage={messageToShow.lastMessage}
          imageId={messageToShow.imageId}
          videoId={messageToShow.videoId}
          chatId={messageToShow.id}
        />,
        toastOptions,
      );
    }
  }, [
    toastQueue,
    isToastActive,
    isPC,
    pathname,
    router,
    removeFromToastQueue,
    isInCall,
  ]);

  // 通話開始時に表示中のトーストがあれば即時dismiss
  useEffect(() => {
    if (isInCall) {
      toast.dismiss();
      setIsToastActive(false);
    }
  }, [isInCall]);

  // 埋め込みモードの場合はtoastを表示しない
  if (isEmbedded) {
    return null;
  }

  return (
    <>
      {isPC ? (
        <ToastContainer
          {...commonToastContainerProps}
          position="top-right"
          transition={slideRight}
          className="!fixed !top-[90px] !right-5 !w-[70%] !max-w-[340px] !z-[10000]"
        />
      ) : (
        <ToastContainer
          {...commonToastContainerProps}
          position="top-center"
          transition={Zoom}
          className="!fixed !top-[50px] !left-1/2 !-translate-x-1/2 !w-[70%] !max-w-[340px] !z-[10000]"
        />
      )}
    </>
  );
};

export default AppToast;
