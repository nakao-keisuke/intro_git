import AgoraRTM, { type OccupancyDetail } from 'agora-rtm-sdk';
import { useNavigate } from '@tanstack/react-router';
import { useCallback, useEffect, useRef, useState } from 'react';

import { callEventKeys } from '@/constants/callEventKeys';
import {
  GET_RTM_LOGIN_AUTH,
  HTTP_SEND_ABSENCE_CALL_MESSAGE,
} from '@/constants/endpoints';
import { event } from '@/constants/ga4Event';
import { pointLessMessage } from '@/constants/message';
import { rtmMessageType } from '@/constants/RtmMessageType';
import { useFleaMarketStore } from '@/features/fleamarket/store/fleaMarketStore';
import { useLiveStore } from '@/features/live/store/liveStore';
import { useLovenseStore } from '@/features/lovense/store/lovenseStore';
import callEventEmitter from '@/libs/callEventEmitter';
import { ClientHttpClient } from '@/libs/http/ClientHttpClient';
import { useCallStore } from '@/stores/callStore';
import { usePointStore } from '@/stores/pointStore';
import { useUIStore } from '@/stores/uiStore';
import type { ChannelInfo } from '@/types/ChannelInfo';
import { CALL_ERROR_CATEGORY } from '@/types/callErrorCategory';
import type { RtmLoginAuth } from '@/types/RtmLoginAuth';
import { afterCall, beforeCall, inCall } from '@/utils/callState';
import {
  type CallType,
  getCallView,
  type LiveCallType,
} from '@/utils/callView';
import { trackEvent } from '@/utils/eventTracker';
import { postToNext } from '@/utils/next';
import { addCallBreadcrumb } from '@/utils/sentry/callBreadcrumbs';
import { captureCallError } from '@/utils/sentry/captureCallError';

import { type CallEndedInfo, callEndedInfoKey } from './useCallEndModal';

export const useAgoraRTM = (
  channelInfo: ChannelInfo,
  callType: CallType,
  setSuggestNewCallType?: React.Dispatch<
    React.SetStateAction<LiveCallType | null>
  >,
  isLive?: boolean,
) => {
  const setIsRtmLoginDoneWhenOutGoingCall = useCallStore(
    (s) => s.setIsRtmLoginDoneWhenOutGoingCall,
  );
  const setCurrentPoint = usePointStore((s) => s.setCurrentPoint);
  const callState = useCallStore((s) => s.callState);
  const setCallState = useCallStore((s) => s.setCallState);
  const setLatestLiveChatMessage = useLiveStore(
    (s) => s.setLatestLiveChatMessage,
  );
  const setPromotedFleaMarketItemId = useFleaMarketStore(
    (s) => s.setPromotedItemId,
  );
  const addPurchasedFleaMarketItemId = useFleaMarketStore(
    (s) => s.addPurchasedItemId,
  );
  const isBeforeCallRef = useRef<boolean | undefined>(true);
  const setDeclinedCall = useUIStore((s) => s.setIsDeclinedLiveCall);
  const setAutoLovenseSequenceTriggered = useLovenseStore(
    (s) => s.setAutoSequenceTriggered,
  );
  const setRtmLovenseUpdate = useLovenseStore((s) => s.setRtmLovenseUpdate);
  type RtmMessageEvent = {
    channelType?: string;
    message?: string;
    publisher?: string;
  };
  type RtmPresenceEvent = {
    eventType?: string;
    publisher?: string;
  };

  // biome-ignore lint/suspicious/noExplicitAny: Agora RTM SDK の型定義が不完全なため
  const client = useRef<any | null>(null);
  const channelId = useRef<string | null>(null);
  const rtmId = useRef<string | null>(null);
  const router = useRouter();
  const [viewCount, setViewCount] = useState(0);
  // viewCountの最新値をrefで保持（useCallback内から参照するため）
  const viewCountRef = useRef(0);
  viewCountRef.current = viewCount;
  const viewMemberCount = useRef(new Set<string>());
  // biome-ignore lint/suspicious/noExplicitAny: Agora RTM SDK のイベント型が不完全なため
  const messageEventHandler = useRef<((event: any) => void) | null>(null);
  // biome-ignore lint/suspicious/noExplicitAny: Agora RTM SDK のイベント型が不完全なため
  const presenceEventHandler = useRef<((event: any) => void) | null>(null);
  const [isClientInitialized, setIsClientInitialized] = useState(false);
  const [isPointShortage, setIsPointShortage] = useState(false);
  const attemptEndedSentRef = useRef(false);
  // ユーザー操作による入室フラグ（プロフィールページからのビデオチャット視聴用）
  const isUserInitiatedJoinRef = useRef<boolean>(false);
  // RTMログインキャンセルのコンテキスト追跡用
  const isPageUnloading = useRef(false);
  const isUserCancelled = useRef(false);
  // login中のクリーンアップ競合防止用
  const isLoginInProgress = useRef(false);
  const pendingCleanup = useRef(false);
  // アンマウント後のawait続行防止用
  const isMounted = useRef(true);

  const sendCallAttemptEnded = useCallback(
    (reason: 'declined' | 'no_answer_timeout') => {
      if (attemptEndedSentRef.current) return;
      attemptEndedSentRef.current = true;
      try {
        trackEvent(event.CALL_ATTEMPT_ENDED, {
          call_id: channelInfo.channelId,
          partner_id: channelInfo.peerId,
          user_id: rtmId.current,
          reason,
          call_type: callType,
        });
      } catch (_) {
        // 計測失敗は非致命的なので無視
      }
    },
    [channelInfo.channelId, channelInfo.peerId, callType],
  );

  const onSendMessageToPeer = useCallback(
    // biome-ignore lint/suspicious/noExplicitAny: RTMメッセージの型が可変のため
    async (message: any) => {
      if (client.current == null || !isClientInitialized) return;
      if (!channelInfo.peerId) return;
      await client.current?.publish(
        channelInfo.peerId,
        JSON.stringify(message),
        { channelType: 'USER' },
      );
    },
    [client.current, channelInfo.peerId, isClientInitialized],
  );

  const onSendMessageToChannel = useCallback(
    async (message: any) => {
      if (
        client.current == null ||
        channelId.current == null ||
        !isClientInitialized
      )
        return;
      const refactoredMessage = refactorMessageByCallType(
        message as SendMessage,
      );
      await client.current?.publish(
        channelId.current,
        JSON.stringify(refactoredMessage),
      );
    },
    [client.current, channelId.current, isClientInitialized],
  );

  type SendMessage = {
    text: string;
    sender_name: string | undefined;
    sender_id: string | undefined;
    message_type: string;
    receiver_id: string;
    increase_point: number;
  };

  const refactorMessageByCallType = useCallback(
    (message: SendMessage) => {
      if (
        callType === 'live' &&
        message.message_type === 'chat' &&
        message.text
      ) {
        const isEnteringMessage = message.text.includes('さんが入室しました！');
        const formattedText = isEnteringMessage
          ? `${message.sender_name}${message.text}`
          : `${message.sender_name}: ${message.text}`;

        return {
          ...message,
          text: formattedText,
          sender_name: '',
        };
      }
      return message;
    },
    [callType],
  );

  const setUserCancelled = useCallback(() => {
    isUserCancelled.current = true;
  }, []);

  const onEnd = useCallback(async () => {
    if (isLoginInProgress.current) {
      pendingCleanup.current = true;
      return;
    }
    if (client.current == null) return;

    if (callType === 'live') {
      await onSendMessageToChannel?.({
        message_type: 'leave_live',
        sender_id: rtmId.current,
      });
    }

    // イベントリスナーの削除
    if (messageEventHandler.current) {
      client.current.removeEventListener(
        'message',
        messageEventHandler.current,
      );
      messageEventHandler.current = null;
    }
    if (presenceEventHandler.current) {
      client.current.removeEventListener(
        'presence',
        presenceEventHandler.current,
      );
      presenceEventHandler.current = null;
    }

    if (channelId.current) {
      await client.current
        ?.unsubscribe(channelId.current)
        .catch((_err: any) => {});
      channelId.current = null;
    }
    await client.current?.logout().catch((_err: any) => {});
    client.current = null;
    setIsClientInitialized(false);
  }, [client.current, channelId.current]);

  useEffect(() => {
    window.addEventListener('beforeunload', onEnd);
    return () => {
      window.removeEventListener('beforeunload', onEnd);
    };
  }, [onEnd]);

  useEffect(() => {
    if (callState === inCall) {
      isBeforeCallRef.current = false;
    }
  }, [callState]);

  useEffect(() => {
    return () => {
      if (
        isBeforeCallRef.current &&
        (callType === 'videoCallFromOutgoing' ||
          callType === 'voiceCallFromOutgoing' ||
          callType === 'videoChatFromOutgoing')
      ) {
        const client = new ClientHttpClient();
        client
          .post(HTTP_SEND_ABSENCE_CALL_MESSAGE, {
            partnerId: channelInfo.peerId,
          })
          .catch((err) => {
            console.error('Failed to send absence call message:', err);
          });
      }
    };
  }, []);

  useEffect(() => {
    if (callState === afterCall) {
      setCallState(beforeCall);
    }
    return () => {
      setCallState(beforeCall);
    };
  }, []);

  useEffect(() => {
    // ページ離脱検知
    const handleBeforeUnload = () => {
      isPageUnloading.current = true;
    };
    window.addEventListener('beforeunload', handleBeforeUnload);

    const fetchRtmLoginAuth = async () => {
      const responseData = await postToNext<RtmLoginAuth>(GET_RTM_LOGIN_AUTH, {
        callType,
      });
      if (!isMounted.current) return;
      if (responseData.type === 'error') {
        if (!isMounted.current) return;
        if (responseData.message === pointLessMessage) {
          setIsPointShortage(true);
        }
        return;
      }
      setCurrentPoint(responseData.point);
      rtmId.current = responseData.rtmId;

      // 新しいRTMクライアントの初期化
      const currentClient = new AgoraRTM.RTM(
        responseData.appId,
        responseData.rtmId,
      );
      client.current = currentClient;

      // メッセージイベントハンドラー
      messageEventHandler.current = async (event: any) => {
        // ピアメッセージの処理
        if (event.channelType === 'USER') {
          // 2025/02/17時点で第一世界線からのピアメッセージを仮定している
          try {
            // 第一世界線用メッセージ生成
            const { message_type, isAccepted_call } = JSON.parse(
              event.message as string,
            );

            if (
              message_type === 'voiceCallReply' ||
              message_type === 'videoCallReply'
            ) {
              // 返答によって通話開始の制御を行う
              if (isAccepted_call) {
                setCallState(inCall);

                // START_VOICE_CALLとSTART_VIDEO_CALLはポイント消費開始時に送信されるため、ここでは送信しない
              } else if (isAccepted_call === false) {
                // ビデオチャット視聴中 AND 通話開始前のみスキップ
                // - callType が 'live' または 'sideWatch': ビデオチャット視聴モード
                // - callState が beforeCall: まだ通話を開始していない（視聴のみ）
                // この場合、着信拒否メッセージを受け取ってもRTM接続を維持する
                if (
                  (callType === 'live' || callType === 'sideWatch') &&
                  callState === beforeCall
                ) {
                  return;
                }
                // 通話拒否として計測
                sendCallAttemptEnded('declined');

                addCallBreadcrumb(
                  'RTM reject received (peer, world1)',
                  'rtm',
                  {
                    callType,
                    callState,
                    partnerId: channelInfo.peerId,
                    message_type,
                  },
                  'warning',
                );

                // callEndedInfoを保存してユーザーにメッセージを表示
                const callEndedInfo: CallEndedInfo = {
                  type: 'withChatButton',
                  message: '相手が通話を終了しました',
                  partnerId: channelInfo.peerId!,
                  callType,
                };
                sessionStorage.setItem(
                  callEndedInfoKey,
                  JSON.stringify(callEndedInfo),
                );

                await onEnd();
                callEventEmitter.emit(callEventKeys.callEnd);
              }
              return;
            }

            // 以下第二世界線用処理
            // 音声通話発信の場合RTMメッセージを受け取らない
            if (callType === 'voiceCallFromOutgoing') {
              setDeclinedCall(true);
            }

            // 第二世界線用メッセージ生成
            const reply = JSON.parse(event.message as string) as {
              message_type:
                | 'videoCallFromStandby'
                | 'liveFromStandby'
                | 'videoCallReply';
              messageType?: 'updatePromotedFleaMarketItem';
              is_accepted?: boolean;
              is_peep?: boolean;
              itemId?: string;
            };

            if (reply.is_accepted) {
              if (
                callType === 'videoCallFromStandby' ||
                callType === 'videoCallFromOutgoing' ||
                callType === 'live' ||
                callType === 'sideWatch'
              ) {
                // ビデオチャット視聴（プロフィールページからの入室）の場合は、ユーザーアクションを必須にする
                if (callType === 'live' || callType === 'sideWatch') {
                  if (isUserInitiatedJoinRef.current) {
                    setCallState(inCall);
                    isUserInitiatedJoinRef.current = false; // フラグをリセット
                  }
                } else {
                  // 発信・ビデオ通話待機の場合は従来通り
                  setCallState(inCall);
                }

                // START_VIDEO_CHATとSTART_VIDEO_CALLはポイント消費開始時に送信されるため、ここでは送信しない
              } else {
                setSuggestNewCallType?.('live');
              }
            } else if (reply.messageType === 'updatePromotedFleaMarketItem') {
              setPromotedFleaMarketItemId(reply.itemId!);
            } else {
              setDeclinedCall(true);
              sendCallAttemptEnded('declined');

              addCallBreadcrumb(
                'RTM reject received (peer, world2)',
                'rtm',
                {
                  callType,
                  callState,
                  partnerId: channelInfo.peerId,
                },
                'warning',
              );

              const callEndedInfo: CallEndedInfo = {
                type: 'withChatButton',
                message: '相手が通話を終了しました',
                partnerId: channelInfo.peerId!,
                callType,
              };
              sessionStorage.setItem(
                callEndedInfoKey,
                JSON.stringify(callEndedInfo),
              );
            }
          } catch (e) {
            console.error('[RTM] Peer message parse error:', e);
            addCallBreadcrumb(
              'RTM peer message parse error',
              'rtm',
              {
                error: e instanceof Error ? e.message : String(e),
              },
              'warning',
            );
          }
        }
        // チャンネルメッセージの処理
        else {
          try {
            const reply = JSON.parse(event.message as string) as {
              message_type: string;
              is_answer?: boolean;
              text?: string;
              sender_name?: string;
              sender_id?: string;
              type?: string;
              intensity?: number;
              duration?: number;
            };

            if (
              (reply.type === 'lovense.update' ||
                reply.message_type === 'lovense.update') &&
              typeof reply.intensity === 'number' &&
              typeof reply.duration === 'number'
            ) {
              if (
                reply.intensity >= 0 &&
                reply.intensity <= 20 &&
                reply.duration >= 0
              ) {
                setRtmLovenseUpdate({
                  intensity: reply.intensity,
                  duration: reply.duration,
                  updatedAt: Date.now(),
                  senderId: event.publisher,
                });
              }
            }

            if (
              (callType === 'videoCallFromOutgoing' ||
                callType === 'voiceCallFromOutgoing') &&
              reply.message_type === 'videoCallReply'
            ) {
              if (reply.is_answer) {
                setCallState(inCall);

                // START_VOICE_CALLとSTART_VIDEO_CALLはポイント消費開始時に送信されるため、ここでは送信しない
              } else {
                setDeclinedCall(true);
                sendCallAttemptEnded('declined');

                addCallBreadcrumb(
                  'RTM reject received (channel, videoCallReply)',
                  'rtm',
                  {
                    callType,
                    callState,
                    partnerId: channelInfo.peerId,
                  },
                  'warning',
                );

                const callEndedInfo: CallEndedInfo = {
                  type: 'withChatButton',
                  message: '相手が通話を終了しました',
                  partnerId: channelInfo.peerId!,
                  callType,
                };
                sessionStorage.setItem(
                  callEndedInfoKey,
                  JSON.stringify(callEndedInfo),
                );
              }
            }

            if (
              callType === 'videoChatFromOutgoing' &&
              reply.message_type === 'liveCallReply'
            ) {
              if (reply.is_answer) {
                setCallState(inCall);

                // START_VIDEO_CHATはポイント消費開始時に送信されるため、ここでは送信しない
              } else {
                setDeclinedCall(true);
                sendCallAttemptEnded('declined');

                addCallBreadcrumb(
                  'RTM reject received (channel, liveCallReply)',
                  'rtm',
                  {
                    callType,
                    callState,
                    partnerId: channelInfo.peerId,
                  },
                  'warning',
                );

                const callEndedInfo: CallEndedInfo = {
                  type: 'withChatButton',
                  message: '相手が通話を終了しました',
                  partnerId: channelInfo.peerId!,
                  callType,
                };
                sessionStorage.setItem(
                  callEndedInfoKey,
                  JSON.stringify(callEndedInfo),
                );
              }
            }

            if (reply.message_type === 'chat') {
              if (reply.text) {
                setLatestLiveChatMessage({
                  text: reply.text,
                  ...(reply.sender_id && { sender_id: reply.sender_id }),
                  ...(reply.sender_name && { sender_name: reply.sender_name }),
                });
              }
            }

            // ピックアップ商品の更新（女性側からの指定）
            // 送信側が messageType (camelCase) を使用しているため両方をチェック
            const replyWithType = reply as {
              message_type?: string;
              messageType?: string;
              itemId?: string;
            };
            const messageType =
              replyWithType.message_type || replyWithType.messageType;
            if (messageType === 'updatePromotedFleaMarketItem') {
              const itemId = replyWithType.itemId;
              if (itemId) {
                setPromotedFleaMarketItemId(itemId);
              }
            }

            // ピックアップ商品の削除（女性側からの指定解除）
            if (messageType === 'deletePromotedFleaMarketItem') {
              setPromotedFleaMarketItemId(null);
            }

            // フリマ商品が購入された（他の視聴者の購入通知）
            if (messageType === 'fleaMarketItemSold') {
              const purchasedItemId = replyWithType.itemId;
              if (purchasedItemId) {
                // ピックアップ商品だった場合は非表示にする
                const currentPromotedId =
                  useFleaMarketStore.getState().promotedItemId;
                if (currentPromotedId === purchasedItemId) {
                  setPromotedFleaMarketItemId(null);
                }

                // 購入済み商品IDをセットに追加（商品リストのフィルタリング用）
                addPurchasedFleaMarketItemId(purchasedItemId);
              }
            }

            // 視聴者数カウント（メッセージ送信者を記録）
            if (!viewMemberCount.current.has(event.publisher)) {
              viewMemberCount.current.add(event.publisher);
              setViewCount((prev) => prev + 1);
            }
          } catch (e) {
            console.error('[RTM] Channel message parse error:', e);
            addCallBreadcrumb(
              'RTM channel message parse error',
              'rtm',
              {
                error: e instanceof Error ? e.message : String(e),
              },
              'warning',
            );
          }
        }
      };

      // Presenceイベントハンドラー（メンバー入退室検知用）
      presenceEventHandler.current = async (event: any) => {
        // メンバー入室検知
        if (event.eventType === 'REMOTE_JOIN') {
          const userId = event.publisher;

          // 視聴者数の更新（重複を防ぐ、配信者は除外）
          if (
            userId &&
            userId !== channelInfo.peerId &&
            !viewMemberCount.current.has(userId)
          ) {
            viewMemberCount.current.add(userId);
            setViewCount((prev) => prev + 1);
          }
        }

        // メンバー離脱検知
        if (event.eventType === 'REMOTE_LEAVE') {
          const userId = event.publisher;

          // 視聴者数の更新
          if (viewMemberCount.current.has(userId)) {
            viewMemberCount.current.delete(userId);
            setViewCount((prev) => prev - 1);
          }

          // 待機画面で女性ユーザーが退出したときに自分も退出する
          if (!isBeforeCallRef.current) return;
          if (userId === channelInfo.peerId) {
            const callEndedInfo: CallEndedInfo = {
              type: 'withChatButton',
              message: getCallView(callType).endedBeforeCallMessage,
              partnerId: userId,
              callType,
            };
            sessionStorage.setItem(
              callEndedInfoKey,
              JSON.stringify(callEndedInfo),
            );
            router.push('/girls/all');
          }
        }
      };

      // イベントリスナーの登録
      currentClient.addEventListener('message', messageEventHandler.current);
      currentClient.addEventListener('presence', presenceEventHandler.current);

      // client.current セット後〜login開始前のギャップでonEnd()が呼ばれても
      // isLoginInProgressガードでpendingCleanupに回るようにする
      isLoginInProgress.current = true;

      const rtmChannelId = sessionStorage.getItem('rtmChannelId');

      // ログイン
      // try/catchを使用し、ログイン失敗時はfetchRtmLoginAuth全体からreturnする
      // これにより、失敗後にsetIsClientInitialized(true)が実行されるバグを防ぐ
      try {
        await currentClient.login({
          token: responseData.rtmChannelToken,
        });
      } catch (err: any) {
        isLoginInProgress.current = false;
        console.error('[RTM] Login failed:', err);

        const errorCode = err?.code;
        const errorMessage = err?.message || String(err);
        const isLoginCanceled = errorCode === -10023;

        if (isLoginCanceled) {
          // Pattern 1: ページ離脱（ブラウザバック、タブを閉じる、別ページへ遷移）
          if (isPageUnloading.current) {
            addCallBreadcrumb(
              'RTM login canceled due to page unload',
              'rtm.login_canceled.page_unload',
              {
                callType,
                partnerId: channelInfo.peerId,
                errorCode,
              },
              'info',
            );
            client.current = null;
            setIsClientInitialized(false);
            return;
          }

          // Pattern 2: ユーザーの明示的なキャンセル操作
          // QuickJoinHandler（callType='live'）の「キャンセル」ボタン
          if (isUserCancelled.current) {
            addCallBreadcrumb(
              'RTM login canceled by user action',
              'rtm.login_canceled.user_action',
              {
                callType,
                partnerId: channelInfo.peerId,
                errorCode,
              },
              'info',
            );
            client.current = null;
            setIsClientInitialized(false);
            return;
          }

          // Pattern 2.5: pendingCleanupによる遅延クリーンアップで安全に処理されるケース
          if (pendingCleanup.current) {
            addCallBreadcrumb(
              'RTM login canceled with pending cleanup (handled safely)',
              'rtm.login_canceled.pending_cleanup',
              {
                callType,
                partnerId: channelInfo.peerId,
                errorCode,
              },
              'info',
            );
            pendingCleanup.current = false;
            client.current = null;
            setIsClientInitialized(false);
            return;
          }

          // Pattern 3: コンポーネントアンマウント（React側でコンポーネントが破棄）
          // 全てerrorとして扱う

          // callType='live'（QuickJoinHandler/LiveComponent）の予期しないアンマウント
          if (callType === 'live') {
            addCallBreadcrumb(
              'RTM login canceled: Live component unmounted unexpectedly',
              'rtm.login_canceled.component_unmount.live',
              {
                callType,
                partnerId: channelInfo.peerId,
                errorCode,
                component: 'QuickJoinHandler or LiveComponent',
              },
              'error',
            );
            captureCallError(
              err instanceof Error ? err : new Error(errorMessage),
              CALL_ERROR_CATEGORY.RTM_LOGIN_FAILED,
              {
                callType,
                partnerId: channelInfo.peerId,
                errorCode,
                reason: 'unexpected_unmount_live',
              },
            );
            client.current = null;
            setIsClientInitialized(false);
            return;
          }

          // 通話系コンポーネント（voiceCall, videoCallFromOutgoing/Incoming）の
          // 予期しないアンマウント → error
          if (
            callType === 'voiceCall' ||
            callType === 'voiceCallFromOutgoing' ||
            callType === 'videoCallFromOutgoing' ||
            callType === 'videoCallFromIncoming'
          ) {
            addCallBreadcrumb(
              'RTM login canceled: call component unmounted unexpectedly',
              'rtm.login_canceled.component_unmount.call',
              {
                callType,
                partnerId: channelInfo.peerId,
                errorCode,
              },
              'error',
            );
            captureCallError(
              err instanceof Error ? err : new Error(errorMessage),
              CALL_ERROR_CATEGORY.RTM_LOGIN_FAILED,
              {
                callType,
                partnerId: channelInfo.peerId,
                errorCode,
                reason: 'unexpected_unmount_during_call',
              },
            );
            client.current = null;
            setIsClientInitialized(false);
            return;
          }

          // その他のcallTypeの予期しないアンマウント → error
          addCallBreadcrumb(
            'RTM login canceled: component unmounted unexpectedly',
            'rtm.login_canceled.component_unmount.other',
            {
              callType,
              partnerId: channelInfo.peerId,
              errorCode,
            },
            'error',
          );
          captureCallError(
            err instanceof Error ? err : new Error(errorMessage),
            CALL_ERROR_CATEGORY.RTM_LOGIN_FAILED,
            {
              callType,
              partnerId: channelInfo.peerId,
              errorCode,
              reason: 'unexpected_unmount_other',
            },
          );
          client.current = null;
          setIsClientInitialized(false);
          return;
        }

        // Login canceled以外のエラー → 従来通りerrorとして送信
        captureCallError(
          err instanceof Error ? err : new Error(errorMessage),
          CALL_ERROR_CATEGORY.RTM_LOGIN_FAILED,
          {
            callType,
            partnerId: channelInfo.peerId,
            errorCode,
          },
        );
        client.current = null;
        setIsClientInitialized(false);
        return;
      }
      isLoginInProgress.current = false;

      // アンマウント後にログインが完了した場合、以降の処理を中断
      if (!isMounted.current) {
        addCallBreadcrumb(
          'RTM login completed after unmount, aborting',
          'rtm.abort_after_unmount',
          { callType, partnerId: channelInfo.peerId },
          'info',
        );
        if (messageEventHandler.current) {
          currentClient.removeEventListener(
            'message',
            messageEventHandler.current,
          );
          messageEventHandler.current = null;
        }
        if (presenceEventHandler.current) {
          currentClient.removeEventListener(
            'presence',
            presenceEventHandler.current,
          );
          presenceEventHandler.current = null;
        }
        await currentClient.logout().catch(() => {});
        client.current = null;
        setIsClientInitialized(false);
        return;
      }

      // アンマウント中にログインが完了した場合、遅延クリーンアップを実行
      // NOTE: leave_live メッセージ送信と unsubscribe はスキップ
      // （login 直後で subscribe 未完了のため不要）
      if (pendingCleanup.current) {
        pendingCleanup.current = false;
        addCallBreadcrumb(
          'RTM login completed but cleanup was pending, executing deferred cleanup',
          'rtm.deferred_cleanup',
          { callType, partnerId: channelInfo.peerId },
          'info',
        );
        if (messageEventHandler.current) {
          currentClient.removeEventListener(
            'message',
            messageEventHandler.current,
          );
          messageEventHandler.current = null;
        }
        if (presenceEventHandler.current) {
          currentClient.removeEventListener(
            'presence',
            presenceEventHandler.current,
          );
          presenceEventHandler.current = null;
        }
        await currentClient.logout().catch(() => {});
        client.current = null;
        setIsClientInitialized(false);
        return;
      }

      if (
        callType === 'videoCallFromOutgoing' ||
        callType === 'voiceCallFromOutgoing' ||
        callType === 'videoChatFromOutgoing'
      ) {
        setIsRtmLoginDoneWhenOutGoingCall(true);
      }
      // 発信時の世界線分岐処理：RTMログイン後に発信リクエストを送信
      if (
        callType === 'videoCallFromOutgoing' ||
        callType === 'voiceCallFromOutgoing' ||
        callType === 'videoChatFromOutgoing'
      ) {
        try {
          const requestMessageType =
            callType === 'voiceCallFromOutgoing'
              ? rtmMessageType.voiceCallRequest
              : rtmMessageType.videoCallRequest;

          if (channelInfo.isPartnerInSecondApps) {
            // 第2世界線: チャンネルメッセージで送信
            const currentChannelId = rtmChannelId ?? channelInfo.channelId;
            if (!currentChannelId || currentChannelId.trim() === '') {
              console.error('[RTM] Invalid channel ID, skipping publish:', {
                rtmChannelId,
                channelId: channelInfo.channelId,
              });
            } else {
              await currentClient.publish(
                currentChannelId,
                JSON.stringify({
                  message_type: requestMessageType,
                  sender_id: rtmId.current,
                }),
              );
            }
          } else {
            // 第1世界線(foca-iOS等): ピアメッセージで送信
            if (!channelInfo.peerId) {
              console.error(
                'peerId is required for first world line outgoing calls',
              );
              return;
            }

            await currentClient.publish(
              channelInfo.peerId,
              JSON.stringify({
                message_type: requestMessageType,
                sender_id: rtmId.current,
              }),
              { channelType: 'USER' },
            );
          }
        } catch (error) {
          console.error('Failed to send outgoing call request:', error);
        }

        if (!isMounted.current) return;
      }

      // チャンネルをsubscribe（withPresenceでPresenceイベントを受信）
      const currentChannelId = rtmChannelId ?? channelInfo.channelId;

      if (!currentChannelId || currentChannelId.trim() === '') {
        console.error('[RTM] Invalid channel ID, skipping subscribe:', {
          rtmChannelId,
          channelId: channelInfo.channelId,
        });
        captureCallError(
          new Error(`Invalid RTM channel name: "${currentChannelId}"`),
          CALL_ERROR_CATEGORY.RTM_SUBSCRIBE_FAILED,
          {
            callType,
            partnerId: channelInfo.peerId,
            channelId: currentChannelId || '',
            reason: 'empty_or_invalid_channel_name',
          },
        );
        client.current = null;
        setIsClientInitialized(false);
        return;
      }

      channelId.current = currentChannelId;

      try {
        await client.current?.subscribe(currentChannelId, {
          withPresence: true,
        });
      } catch (err: unknown) {
        console.error('[RTM] Subscribe failed:', err);
        captureCallError(
          err instanceof Error ? err : new Error(String(err)),
          CALL_ERROR_CATEGORY.RTM_SUBSCRIBE_FAILED,
          {
            callType,
            partnerId: channelInfo.peerId,
            channelId: currentChannelId,
          },
        );
        channelId.current = null;
        setIsClientInitialized(false);
        return;
      }

      if (!isMounted.current) return;

      // クライアントの初期化が完了したことを示す
      // login() + subscribe() の両方が完了してからボタンを有効化する
      // subscribe完了前にメッセージ送信すると、相手に到達しない場合がある（特にAndroid）
      setIsClientInitialized(true);

      // 自分自身を視聴者数にカウント
      if (rtmId.current && !viewMemberCount.current.has(rtmId.current)) {
        viewMemberCount.current.add(rtmId.current);
        setViewCount((prev) => prev + 1);
      }

      // whoNowで既存メンバーを取得（1人目判定の精度向上のため）
      try {
        const whoNowResponse = await client.current?.presence?.whoNow(
          currentChannelId,
          'MESSAGE',
        );
        if (whoNowResponse?.occupants) {
          for (const occupant of whoNowResponse.occupants) {
            // 自分以外かつ配信者以外の既存メンバーをカウント
            if (
              occupant.userId &&
              occupant.userId !== rtmId.current &&
              occupant.userId !== channelInfo.peerId &&
              !viewMemberCount.current.has(occupant.userId)
            ) {
              viewMemberCount.current.add(occupant.userId);
              setViewCount((prev) => prev + 1);
            }
          }
        }
      } catch (err) {
        console.error('whoNow error:', err);
      }

      if (
        callType !== 'videoCallFromOutgoing' &&
        callType !== 'voiceCall' &&
        callType !== 'videoChatFromOutgoing'
      ) {
        // 通話相手が第二世界線じゃない場合（2025/02/18時点では、相手が第一世界線の場合）、相手はチャンネルには居ないので、以下のチェックはしない
        if (channelInfo.isPartnerInSecondApps) {
          // PresenceイベントのwithPresenceオプションで入退室を監視
        }
      }
    };

    fetchRtmLoginAuth();

    if (
      callType === 'videoCallFromOutgoing' ||
      callType === 'voiceCallFromOutgoing' ||
      callType === 'videoChatFromOutgoing'
    ) {
      setTimeout(() => {
        if (isBeforeCallRef.current) {
          const partnerId = channelInfo.peerId;
          if (!partnerId) return;
          // 無応答タイムアウトの計測
          sendCallAttemptEnded('no_answer_timeout');
          const callEndedInfo: CallEndedInfo = {
            type: 'withChatButton',
            message:
              '応答がありませんでした。チャットで通話をお願いしてみましょう♪',
            partnerId,
            callType,
          };
          sessionStorage.setItem(
            callEndedInfoKey,
            JSON.stringify(callEndedInfo),
          );
          router.push('/girls/all');
        }
      }, 30000);
    }

    return () => {
      isMounted.current = false;
      window.removeEventListener('beforeunload', handleBeforeUnload);
      setLatestLiveChatMessage({ text: '', sender_id: undefined });
      setPromotedFleaMarketItemId(null);
      setIsRtmLoginDoneWhenOutGoingCall(false);
      isBeforeCallRef.current = undefined;
      onEnd();
    };
  }, []);

  const onJoin = useCallback(async () => {
    try {
      // ユーザー操作による入室フラグを立てる
      // このフラグにより、RTMメッセージハンドラーで入室を許可する
      isUserInitiatedJoinRef.current = true;
      // クライアントが初期化されているか確認
      if (client.current == null) {
        throw new Error(
          '配信に入室できませんでした。\nページをリフレッシュしてください。',
        );
      }

      if (channelId.current == null) {
        throw new Error(
          '配信に入室できませんでした。\nページをリフレッシュしてください。',
        );
      }

      // SDK 2.2.0ではgetMembersが削除されているため、
      // 相手がチャンネルに存在するかの確認は別の方法で実装する必要があります
      // TODO: heartbeatメッセージやpresence機能を使用した確認実装

      // 相手がチャンネルにいることを前提として、メッセージを送信
      if (!channelInfo.peerId) {
        throw new Error(
          '配信に入室できませんでした。\nページをリフレッシュしてください。',
        );
      }
      const textJson = {
        message_type: 'liveFromStandby',
      };

      await client.current.publish(
        channelInfo.peerId,
        JSON.stringify(textJson),
        { channelType: 'USER' },
      );

      // ビデオチャット視聴開始時のGA4イベント送信と最初の視聴者判定
      if (callType === 'live' || callType === 'sideWatch') {
        // whoNowを呼び出して、リアルタイムの視聴者数を取得
        // viewCountに依存すると、Presenceイベントの反映タイミングで不正確になる可能性がある
        // isLiveの値はポーリングデータの更新タイミングで不正確になる可能性があるため、
        // whoNowの結果のみで最初の視聴者かどうかを判定する
        let isFirstViewer = false;

        if (channelId.current) {
          try {
            const whoNowResponse = await client.current?.presence?.whoNow(
              channelId.current,
              'MESSAGE',
            );

            // occupantsから自分と配信者を除いた視聴者数を計算
            const otherViewers =
              whoNowResponse?.occupants?.filter(
                (occupant: OccupancyDetail) =>
                  occupant.userId !== rtmId.current &&
                  occupant.userId !== channelInfo.peerId,
              ) ?? [];

            // 自分以外の視聴者がいない場合、最初の視聴者
            isFirstViewer = otherViewers.length === 0;
          } catch (err) {
            console.error('whoNow error during first viewer check:', err);
            // エラー時はフォールバックとしてviewCountを使用
            isFirstViewer = viewCountRef.current === 1;
          }
        }

        if (isFirstViewer) {
          // 待機中のビデオチャットに最初の視聴者として入室
          trackEvent(event.WATCH_VIDEO_CHAT_AS_FIRST_VIEWER, {
            partner_id: channelInfo.peerId,
            user_id: rtmId.current,
          });
          // 最初の視聴者として入室した場合、Lovense自動発動シーケンスをトリガー
          setAutoLovenseSequenceTriggered(true);
        } else {
          // Live中のビデオチャットに入室（または2人目以降の視聴者）
          trackEvent(event.WATCH_VIDEO_CHAT_AS_VIEWER, {
            partner_id: channelInfo.peerId,
            user_id: rtmId.current,
          });
        }
      }

      // 戻り値を省略して Promise<void> に適合させる
    } catch (error) {
      console.error('入室処理エラー:', error);
      // エラー発生時はフラグをリセット
      isUserInitiatedJoinRef.current = false;
      throw error; // LiveChannelerModalでキャッチできるようにエラーを再スロー
    }
  }, [
    client.current,
    channelId.current,
    channelInfo.peerId,
    callType,
    isLive,
    setAutoLovenseSequenceTriggered,
  ]);

  return [
    callType === 'videoCallFromOutgoing' ||
    callType === 'voiceCall' ||
    callType === 'voiceCallFromOutgoing' ||
    callType === 'videoChatFromOutgoing' ||
    !isClientInitialized
      ? undefined
      : onJoin,
    onSendMessageToPeer,
    onSendMessageToChannel,
    viewCount,
    onEnd,
    setUserCancelled,
    isClientInitialized,
    isPointShortage,
  ] as const;
};
