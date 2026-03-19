import { getSession, signIn, useSession } from 'next-auth/react';
import { useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import {
  PAY_LIVE_POINT,
  PAY_VIDEO_CALL_POINT,
  PAY_VOICE_CALL_POINT,
} from '@/constants/endpoints';
import { pointLessMessage } from '@/constants/message';
import { useCallStore } from '@/stores/callStore';
import { usePointStore } from '@/stores/pointStore';
import {
  CALL_ERROR_CATEGORY,
  type CallErrorCategory,
} from '@/types/callErrorCategory';
import { inCall } from '@/utils/callState';
import { type CallType, payPointPerMinute } from '@/utils/callView';
import { trackEvent } from '@/utils/eventTracker';
import {
  captureCallError,
  captureCallWarning,
} from '@/utils/sentry/captureCallError';
import { callEndedInfoKey } from './useCallEndModal';
import { useCallService } from './useCallService.hook';

/**
 * Jambo API エラーコード: NOT_IN_CALL
 * 通話が既に終了した後に課金リクエストが到達した場合に返される。
 * ポイントは消費されないため、フロント側では silent discard する。
 */
const JAMBO_ERROR_NOT_IN_CALL = 9320;

const getApiName = (callType: CallType) => {
  switch (callType) {
    case 'live':
    case 'videoChatFromOutgoing':
    case 'videoChatFromIncoming':
      return PAY_LIVE_POINT;
    case 'videoCallFromStandby':
    case 'videoCallFromOutgoing':
    case 'videoCallFromIncoming':
      return PAY_VIDEO_CALL_POINT;
    case 'voiceCall':
      return PAY_VOICE_CALL_POINT;
    default:
      return '';
  }
};

const getPointErrorCategory = (
  isTimeoutError: boolean,
  errorCause:
    | {
        code?: number;
        message?: string;
        errorType?: 'data_missing' | 'server_error';
      }
    | undefined,
): CallErrorCategory => {
  if (isTimeoutError) return CALL_ERROR_CATEGORY.POINT_TIMEOUT;
  if (errorCause?.errorType === 'data_missing')
    return CALL_ERROR_CATEGORY.POINT_DATA_MISSING;
  if (errorCause?.errorType === 'server_error')
    return CALL_ERROR_CATEGORY.POINT_SERVER_ERROR;
  return CALL_ERROR_CATEGORY.POINT_NETWORK_ERROR;
};

export const pointPerMinute = (callType: CallType) =>
  payPointPerMinute(callType);

/**
 * タイマーデバッグログをサーバーに送信
 */
const sendTimerLog = async (data: {
  event: string;
  timerId?: NodeJS.Timeout | null;
  duration?: number;
  callType: CallType;
  myUserId?: string | undefined;
  partnerId: string;
}) => {
  try {
    await fetch('/api/log/timer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...data,
        timerId: data.timerId ? String(data.timerId) : undefined,
        timestamp: Date.now(),
      }),
    });
  } catch {
    // ログ送信エラーは無視（アプリの動作に影響を与えない）
  }
};

export const useCallTimer = (
  partnerId: string,
  onLeave: (code?: number) => Promise<void>,
  onSendMessageToPeer:
    | ((message: Record<string, unknown>) => Promise<void>)
    | undefined,
  onSendMessageToChannel:
    | ((message: Record<string, unknown>) => Promise<void>)
    | undefined,
  callType: CallType,
  onUpdatedCreditInfo?: (isSecondCourseBonusExist: boolean) => void,
  onNeedToPay?: (point: number, money: number, isBonusExist: boolean) => void,
) => {
  const callState = useCallStore((s) => s.callState);
  const setCurrentPoint = usePointStore((s) => s.setCurrentPoint);
  const callDurationSec = useCallStore((s) => s.callDurationSec);
  const incrementCallDurationSec = useCallStore(
    (s) => s.incrementCallDurationSec,
  );
  const callDurationSecRef = useRef<number | undefined>(callDurationSec);
  const callService = useCallService();
  const retryCountRef = useRef<number>(0);
  const isExecutingRef = useRef<boolean>(false);
  const lastRequestDurationRef = useRef<number>(-1);
  const timerIdRef = useRef<NodeJS.Timeout | null>(null);
  const { data: session } = useSession();
  const myUserId = session?.user?.id;

  useEffect(() => {
    // callStateがinCallでない場合は既存のタイマーをクリア
    if (callState !== inCall) {
      if (timerIdRef.current) {
        void sendTimerLog({
          event: 'timer_cleared_on_state_change',
          timerId: timerIdRef.current,
          callType,
          myUserId,
          partnerId,
        });
        clearInterval(timerIdRef.current);
        timerIdRef.current = null;
      }
      return;
    }

    // 既にタイマーが作動している場合は新規作成しない（重複防止）
    if (timerIdRef.current !== null) {
      return;
    }

    // タイマー作成
    timerIdRef.current = setInterval(() => {
      incrementCallDurationSec();
    }, 1000);
    void sendTimerLog({
      event: 'timer_created',
      timerId: timerIdRef.current,
      callType,
      myUserId,
      partnerId,
    });

    return () => {
      // cleanup時は必ずタイマーをクリア
      if (timerIdRef.current) {
        void sendTimerLog({
          event: 'timer_cleared_on_cleanup',
          timerId: timerIdRef.current,
          callType,
          myUserId,
          partnerId,
        });
        clearInterval(timerIdRef.current);
        timerIdRef.current = null;
      }
    };
  }, [callState, callType, myUserId, partnerId, incrementCallDurationSec]);
  useEffect(() => {
    if (callDurationSec === undefined) return;
    callDurationSecRef.current = callDurationSec;
  }, [callDurationSec]);
  useEffect(() => {
    return () => {
      if (callState !== inCall) return;
      switch (callType) {
        case 'live':
        case 'videoChatFromOutgoing':
        case 'videoChatFromIncoming':
          trackEvent('COMPLETE_VIDEO_CHAT');
          break;
        case 'videoCallFromStandby':
        case 'videoCallFromOutgoing':
          trackEvent('COMPLETE_VIDEO_CALL');
          break;
      }
    };
  }, [callState, callType]);
  // biome-ignore lint/correctness/useExhaustiveDependencies: 通話中のコールバック・サービス参照は安定しており、依存に含めるとタイマーが再生成されポイント二重消費のリスクがある
  useEffect(() => {
    if (callDurationSec === undefined) return;

    // 通話開始時（0秒）と4秒ごとにチェック
    if (callDurationSec === 0 || callDurationSec % 4 === 0) {
      // 既に同じdurationでリクエストを実行済みの場合はスキップ
      if (lastRequestDurationRef.current === callDurationSec) {
        return;
      }

      // 実行中の場合はスキップ（重複実行を防止）
      if (isExecutingRef.current) {
        return;
      }

      const checkToPay = async (isRetry: boolean = false): Promise<void> => {
        isExecutingRef.current = true;
        lastRequestDurationRef.current = callDurationSec;
        // ログは初回(0秒)と60秒ごとのみ送信（ネットワーク負荷軽減）
        const shouldLog = callDurationSec === 0 || callDurationSec % 60 === 0;
        if (shouldLog) {
          void sendTimerLog({
            event: 'request_start',
            timerId: timerIdRef.current,
            duration: callDurationSec,
            callType,
            myUserId,
            partnerId,
          });
        }
        try {
          const apiName = getApiName(callType);
          const response = await callService.checkAndPayForCall?.(
            apiName,
            callDurationSec,
            partnerId,
          );

          if (!response) return;

          // 成功した場合はリトライカウントをリセット
          retryCountRef.current = 0;

          const increasePoint = response.broadcasterPoint;
          if (increasePoint > 0) {
            // Agora RTM送信は別のtry-catchで囲む
            // RTMエラーがポイントAPIのリトライを引き起こさないようにする
            try {
              await onSendMessageToChannel?.({
                message_type: 'increasePoint',
                increase_point: increasePoint,
              });

              await onSendMessageToPeer?.({
                message_type: 'increasePoint',
                increase_point: increasePoint,
              });
            } catch (rtmError) {
              // RTMエラーはログのみ、リトライしない
              console.error('[useCallTimer] RTM send error:', rtmError);
              void sendTimerLog({
                event: 'rtm_send_error',
                timerId: timerIdRef.current,
                duration: callDurationSec,
                callType,
                myUserId,
                partnerId,
              });
            }
          }

          const point = response.myPoint;
          if (point > 0) {
            setCurrentPoint(point);
          }

          if (callDurationSec % 60 === 0) {
            if (response.isCreditLogExist) {
              onUpdatedCreditInfo?.(!!response.isSecondCourseBonusExist);
            }
            if (point >= pointPerMinute(callType)) return;
            if (response.isCreditLogExist && onNeedToPay) {
              if (response.isSecondCourseBonusExist) {
                onNeedToPay(800, 980, true);
                return;
              }
              onNeedToPay(800, 980, false);
              return;
            }
            toast('ポイント不足のため1分後に終了します');
          }
        } catch (error: unknown) {
          // タイムアウトエラー（AbortError）の場合はリトライしない
          // サーバー側で処理完了の可能性があり、二重決済防止のため
          const errorObj =
            error instanceof Error ? error : new Error(String(error));
          const isTimeoutError = errorObj.name === 'AbortError';
          const errorCause =
            errorObj.cause != null &&
            typeof errorObj.cause === 'object' &&
            'code' in errorObj.cause
              ? (errorObj.cause as {
                  code?: number;
                  message?: string;
                  errorType?: 'data_missing' | 'server_error';
                })
              : undefined;
          const isPointShortage = errorObj.message === pointLessMessage;
          const isNotInCall = errorCause?.code === JAMBO_ERROR_NOT_IN_CALL;

          // NOT_IN_CALL(9320): 通話終了後に遅延した課金リクエストが到達しただけなので
          // Sentry送信・リトライ・通話切断すべて不要
          if (isNotInCall) {
            void sendTimerLog({
              event: 'not_in_call_silent_discard',
              timerId: timerIdRef.current,
              duration: callDurationSec,
              callType,
              myUserId,
              partnerId,
            });
            return;
          }

          const pointState = usePointStore.getState();
          const currentPoint =
            typeof pointState.currentPoint === 'number'
              ? pointState.currentPoint
              : 'ポイント情報取得不可';

          if (isPointShortage) {
            // ポイント不足(code=70)は正常なビジネスイベントのためinfoレベルで送信
            // 件数を追えるようにSentryには送信する
            captureCallWarning(
              'ポイント不足により通話終了',
              CALL_ERROR_CATEGORY.POINT_SHORTAGE,
              {
                callType,
                partnerId,
                callDurationSec,
                currentPoint,
              },
              'info',
            );
          } else {
            const category = getPointErrorCategory(isTimeoutError, errorCause);
            captureCallError(errorObj, category, {
              callType,
              partnerId,
              callDurationSec,
              currentPoint,
              isTimeoutError,
              responseCode: errorCause?.code,
              responseMessage: errorCause?.message,
            });
          }

          if (isTimeoutError) {
            void sendTimerLog({
              event: 'timeout_error_skip_retry',
              timerId: timerIdRef.current,
              duration: callDurationSec,
              callType,
              myUserId,
              partnerId,
            });
          }

          if (
            !isTimeoutError &&
            !isPointShortage &&
            !isRetry &&
            retryCountRef.current < 1
          ) {
            retryCountRef.current++;

            try {
              const session = await getSession();

              if (!session) return;

              const email = session.user?.email;
              const password = session.user?.pass;
              const phone = session.user?.phone;
              const googleAccountId = session.user?.googleAccountId;
              const lineId = session.user?.lineId;

              // ログイン処理を走らせた上でリトライ
              await signIn('autoLogin', {
                redirect: false,
                email: email,
                password: password,
                phone: phone,
                googleAccountId: googleAccountId,
                lineId: lineId,
              });

              // 少し待機してからリトライ（トークン更新が反映されるのを待つ）
              await new Promise((resolve) => setTimeout(resolve, 500));

              // リトライ実行
              await checkToPay(true);
              return;
            } catch (updateError) {
              console.error('Failed to refresh token:', updateError);
              captureCallError(
                updateError instanceof Error
                  ? updateError
                  : new Error(String(updateError)),
                CALL_ERROR_CATEGORY.POINT_TOKEN_REFRESH_FAILED,
                {
                  callType,
                  partnerId,
                  callDurationSec,
                  currentPoint,
                },
              );
              // トークン更新に失敗した場合は通常のエラー処理を続行
            }
          }

          const callEndedInfo = {
            type: isPointShortage ? 'pointless' : 'error',
            message: isPointShortage
              ? 'ポイントをGETして通話しよう!'
              : '通信エラーにより切断されました',
            partnerId,
            callType,
          };
          sessionStorage.setItem(
            callEndedInfoKey,
            JSON.stringify(callEndedInfo),
          );
          // ポイント不足の場合は専用コード888を渡す
          const leaveCode = isPointShortage ? 888 : undefined;
          onLeave(leaveCode);
          return;
        } finally {
          isExecutingRef.current = false;
          if (shouldLog) {
            void sendTimerLog({
              event: 'request_complete',
              timerId: timerIdRef.current,
              duration: callDurationSec,
              callType,
              myUserId,
              partnerId,
            });
          }
        }
      };
      checkToPay();
    }

    // cleanup関数ではフラグをリセットしない（非同期処理の完了を待つ）
  }, [callDurationSec]);
  return callDurationSec;
};
