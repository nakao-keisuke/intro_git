import { useState } from 'react';
import type {
  GetLovenseMenuListResponse,
  GetUncompletedLovenseLogResponse,
  LovenseMenuItem,
  PayLovenseMenuPointResponse,
  SendLovenseControlCommandResponse,
  UncompletedLovenseLogItem,
} from '@/apis/http/lovense';
import {
  HTTP_GET_LOVENSE_MENU_LIST,
  HTTP_GET_UNCOMPLETED_LOVENSE_LOG,
  HTTP_PAY_LOVENSE_MENU_POINT,
  HTTP_SEND_LOVENSE_CONTROL_COMMAND,
} from '@/constants/endpoints';
import { ClientHttpClient } from '@/libs/http/ClientHttpClient';
import type { ResponseData } from '@/types/NextApi';

// ──────────────────────────────────────────
// Lovenseメニュー一覧取得フック
// ──────────────────────────────────────────

type GetLovenseMenuListResult = {
  menuList: LovenseMenuItem[];
  canGetTicket?: boolean;
  isOnCampaign?: boolean;
};

type UseGetLovenseMenuListReturn = {
  fetchLovenseMenuList: (
    partnerId: string,
    callType: 'live' | 'side_watch' | 'video',
  ) => Promise<GetLovenseMenuListResult>;
  isLoading: boolean;
  error: string | null;
};

export const useGetLovenseMenuList = (): UseGetLovenseMenuListReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLovenseMenuList = async (
    partnerId: string,
    callType: 'live' | 'side_watch' | 'video',
  ): Promise<GetLovenseMenuListResult> => {
    if (isLoading) return { menuList: [] };
    setIsLoading(true);
    setError(null);

    try {
      const client = new ClientHttpClient();
      const response = await client.post<
        ResponseData<GetLovenseMenuListResponse>
      >(HTTP_GET_LOVENSE_MENU_LIST, {
        partner_id: partnerId,
        call_type: callType,
      });

      if (response.type === 'error') {
        setError(response.message || 'エラーが発生しました');
        return { menuList: [] };
      }

      return {
        menuList: response.menuList || [],
        ...(response.canGetTicket !== undefined && {
          canGetTicket: response.canGetTicket,
        }),
        ...(response.isOnCampaign !== undefined && {
          isOnCampaign: response.isOnCampaign,
        }),
      };
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'エラーが発生しました';
      setError(errorMessage);
      return { menuList: [] };
    } finally {
      setIsLoading(false);
    }
  };

  return { fetchLovenseMenuList, isLoading, error };
};

// ──────────────────────────────────────────
// Lovenseメニューポイント消費フック
// ──────────────────────────────────────────

type PayLovenseMenuPointParams = {
  partnerId: string;
  type: string;
  consumePoint: number;
  duration: number;
  callType: 'live' | 'side_watch' | 'video';
  isFreeAction?: boolean;
};

type PayLovenseMenuPointResult = {
  success: boolean;
  myPoint?: number;
  partnerPoint?: number;
  isLovenseOffline?: boolean;
  isInsufficientPoints?: boolean;
  isConnectionError?: boolean;
  message?: string;
};

type UsePayLovenseMenuPointReturn = {
  payLovenseMenuPoint: (
    params: PayLovenseMenuPointParams,
  ) => Promise<PayLovenseMenuPointResult>;
  isLoading: boolean;
  error: string | null;
};

export const usePayLovenseMenuPoint = (): UsePayLovenseMenuPointReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const payLovenseMenuPoint = async (
    params: PayLovenseMenuPointParams,
  ): Promise<PayLovenseMenuPointResult> => {
    if (isLoading) return { success: false };
    setIsLoading(true);
    setError(null);

    try {
      const client = new ClientHttpClient();
      const response = await client.post<
        ResponseData<PayLovenseMenuPointResponse>
      >(HTTP_PAY_LOVENSE_MENU_POINT, {
        partner_id: params.partnerId,
        type: params.type,
        consume_point: params.consumePoint,
        duration: params.duration,
        call_type: params.callType,
        is_free_action: params.isFreeAction,
      });

      if (response.type === 'error') {
        setError(response.message || 'エラーが発生しました');
        // エラーレスポンスには追加のフラグが含まれる可能性がある
        const errorResponse =
          response as ResponseData<PayLovenseMenuPointResponse> & {
            isLovenseOffline?: boolean;
            isInsufficientPoints?: boolean;
            isConnectionError?: boolean;
          };
        return {
          success: false,
          ...(errorResponse.isLovenseOffline && {
            isLovenseOffline: errorResponse.isLovenseOffline,
          }),
          ...(errorResponse.isInsufficientPoints && {
            isInsufficientPoints: errorResponse.isInsufficientPoints,
          }),
          ...(errorResponse.isConnectionError && {
            isConnectionError: errorResponse.isConnectionError,
          }),
          message: response.message,
        };
      }

      return {
        success: true,
        myPoint: response.myPoint,
        partnerPoint: response.partnerPoint,
      };
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'エラーが発生しました';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  return { payLovenseMenuPoint, isLoading, error };
};

// ──────────────────────────────────────────
// 未完了Lovenseログ取得フック
// ──────────────────────────────────────────

type GetUncompletedLovenseLogResult = {
  logLovenseMenuList: UncompletedLovenseLogItem[];
  isLovenseOffline?: boolean;
};

type UseGetUncompletedLovenseLogReturn = {
  fetchUncompletedLovenseLog: (
    femaleId: string,
  ) => Promise<GetUncompletedLovenseLogResult>;
  isLoading: boolean;
  error: string | null;
};

export const useGetUncompletedLovenseLog =
  (): UseGetUncompletedLovenseLogReturn => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchUncompletedLovenseLog = async (
      femaleId: string,
    ): Promise<GetUncompletedLovenseLogResult> => {
      if (isLoading) return { logLovenseMenuList: [] };
      setIsLoading(true);
      setError(null);

      try {
        const client = new ClientHttpClient();
        const response = await client.post<
          ResponseData<GetUncompletedLovenseLogResponse>
        >(HTTP_GET_UNCOMPLETED_LOVENSE_LOG, {
          female_id: femaleId,
        });

        if (response.type === 'error') {
          setError(response.message || 'エラーが発生しました');
          // エラーレスポンスには追加のフラグが含まれる可能性がある
          const errorResponse =
            response as ResponseData<GetUncompletedLovenseLogResponse> & {
              isLovenseOffline?: boolean;
            };
          return {
            logLovenseMenuList: [],
            ...(errorResponse.isLovenseOffline && {
              isLovenseOffline: errorResponse.isLovenseOffline,
            }),
          };
        }

        return {
          logLovenseMenuList: response.logLovenseMenuList || [],
        };
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'エラーが発生しました';
        setError(errorMessage);
        return { logLovenseMenuList: [] };
      } finally {
        setIsLoading(false);
      }
    };

    return { fetchUncompletedLovenseLog, isLoading, error };
  };

// ──────────────────────────────────────────
// Lovenseコントロールコマンド送信フック
// ──────────────────────────────────────────

type SendLovenseControlCommandParams = {
  partnerId: string;
  lovenseIntensity: number;
  lovenseTimeSec?: number;
};

type SendLovenseControlCommandResult = {
  success: boolean;
  isSessionNotFound?: boolean;
  isSessionNotStarted?: boolean;
  isSessionExpired?: boolean;
  message?: string;
};

type UseSendLovenseControlCommandReturn = {
  sendLovenseControlCommand: (
    params: SendLovenseControlCommandParams,
  ) => Promise<SendLovenseControlCommandResult>;
  isLoading: boolean;
  error: string | null;
};

export const useSendLovenseControlCommand =
  (): UseSendLovenseControlCommandReturn => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const sendLovenseControlCommand = async (
      params: SendLovenseControlCommandParams,
    ): Promise<SendLovenseControlCommandResult> => {
      if (isLoading) {
        return {
          success: false,
          message: 'コマンド送信処理中です。しばらくお待ちください。',
        };
      }

      if (params.lovenseIntensity < 0 || params.lovenseIntensity > 20) {
        const message = 'lovense_intensityは0〜20の範囲で指定してください';
        setError(message);
        return { success: false, message };
      }

      setIsLoading(true);
      setError(null);

      try {
        const client = new ClientHttpClient();
        const response = await client.post<
          ResponseData<SendLovenseControlCommandResponse>
        >(HTTP_SEND_LOVENSE_CONTROL_COMMAND, {
          partner_id: params.partnerId,
          lovense_intensity: params.lovenseIntensity,
          ...(params.lovenseTimeSec !== undefined && {
            lovense_time_sec: params.lovenseTimeSec,
          }),
        });

        if (response.type === 'error') {
          setError(response.message || 'エラーが発生しました');
          const errorResponse =
            response as ResponseData<SendLovenseControlCommandResponse> & {
              isSessionNotFound?: boolean;
              isSessionNotStarted?: boolean;
              isSessionExpired?: boolean;
            };
          return {
            success: false,
            ...(errorResponse.isSessionNotFound && {
              isSessionNotFound: errorResponse.isSessionNotFound,
            }),
            ...(errorResponse.isSessionNotStarted && {
              isSessionNotStarted: errorResponse.isSessionNotStarted,
            }),
            ...(errorResponse.isSessionExpired && {
              isSessionExpired: errorResponse.isSessionExpired,
            }),
            message: response.message,
          };
        }

        return { success: true };
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'エラーが発生しました';
        setError(errorMessage);
        return { success: false, message: errorMessage };
      } finally {
        setIsLoading(false);
      }
    };

    return { sendLovenseControlCommand, isLoading, error };
  };
