import { getServerSession } from 'next-auth';
import {
  type EndedCallNotificationJamboResponse,
  endedCallNotificationRequest,
} from '@/apis/ended-call-notification';
import { ENDED_CALL_NOTIFICATION } from '@/constants/endpoints';
import type { HttpClient } from '@/libs/http/HttpClient';
import { type APIResponse, Context } from '@/libs/http/type';
import type { ChannelInfo } from '@/types/ChannelInfo';
import type { Thumbnail } from '@/types/image';
import { bodyType } from '@/utils/bodyType';
import { hobby } from '@/utils/hobby';
import { convertToMediaInfo } from '@/utils/image';
import { marriageHistory } from '@/utils/marriageHistory';
import { personality } from '@/utils/personality';
import { region } from '@/utils/region';
import { showingFace } from '@/utils/showingFace';
import { stepToCall } from '@/utils/stepToCall';
import { talkTheme } from '@/utils/talkTheme';
import { convertToSentTime } from '@/utils/timeUti';
import {
  type CallType,
  ENDED_CALL_NOTIFICATION_ERROR_MESSAGES,
  type EndedCallNotificationRequest,
  type EndedCallNotificationResponse,
  type IncomingCallData,
  type MyUserInfoResponse,
  type OutgoingCallData,
  type PartnerInfoResponse,
} from './type';

export interface CheckPayResult {
  myPoint: number;
  broadcasterPoint: number;
  isFirstCourseBonusExist?: boolean;
  isSecondCourseBonusExist?: boolean;
  isThirdCourseBonusExist?: boolean;
  isFourthCourseBonusExist?: boolean;
  isFifthCourseBonusExist?: boolean;
  isCreditLogExist?: boolean;
}

export interface CallService {
  getOutgoingCallData: (
    partnerId: string,
    callType: CallType,
  ) => Promise<OutgoingCallData>;
  getIncomingCallData: (
    partnerId: string,
    callType: CallType,
  ) => Promise<IncomingCallData>;
  checkAndPayForCall?: (
    apiName: string,
    duration: number,
    partnerId: string,
  ) => Promise<CheckPayResult>;
  endedCallNotification?: (
    request: EndedCallNotificationRequest,
  ) => Promise<EndedCallNotificationResponse>;
}

export class ServerCallService implements CallService {
  private readonly apiUrl: string = import.meta.env.API_URL!;

  constructor(private readonly client: HttpClient) {}

  /**
   * チャンネルと通話相手のユーザーの情報を取得して返す
   */
  async getOutgoingCallData(
    partnerId: string,
    callType: CallType,
  ): Promise<OutgoingCallData> {
    if (!partnerId) throw new Error('partnerId is required');

    const { authOptions } = await import(
      '@/app/api/auth/[...nextauth]/options'
    );
    const session = await getServerSession(authOptions);
    const token = session?.user?.token;
    const myUserId = session?.user?.id;

    if (!token) throw new Error('token is required');

    const channelInfoRequest =
      callType === 'video-call'
        ? {
            api: 'get_video_chat_channel',
            token: token,
            channel_type: 'video',
            partner_id: partnerId,
          }
        : {
            api: 'send_voice_call_voip_for_second',
            token: token,
            channel_type: 'voice',
            partner_id: partnerId,
          };

    const partnerInfoRequest = {
      api: 'get_user_inf_for_web',
      user_id: myUserId,
      req_user_id: partnerId,
    };

    const [
      { code: channelCode, data: channelData },
      { code: userCode, data: userData },
    ] = await Promise.all([
      this.client.post<APIResponse<{ channelInfo: ChannelInfo }>>(
        this.apiUrl,
        channelInfoRequest,
      ),
      this.client.post<APIResponse<PartnerInfoResponse>>(
        this.apiUrl,
        partnerInfoRequest,
      ),
    ]);

    if (channelCode) {
      let message;
      switch (channelCode) {
        case 82:
          message = '相手が通話許可設定をOFFにしています。';
          break;
        case 85:
          message = '相手は通話中です。';
          break;
        case 89:
          message = '相手は配信中です。';
          break;
        case 70:
          message = 'ポイントが不足しているため、通話発信に失敗しました';
          break;
        default:
          console.error(
            `[CallService] getOutgoingCallData channel error: code=${channelCode}, partnerId=${partnerId}`,
          );
          message = '不明なサーバーエラーです。';
      }

      throw new Error(message);
    }

    if (userCode !== 0 || !userData) {
      console.error(
        `[CallService] getOutgoingCallData user info error: code=${userCode}, partnerId=${partnerId}, hasData=${!!userData}`,
      );
    }

    const partnerInfo = userData!;

    const isNewUser =
      convertToSentTime(partnerInfo.regDate ?? '202301010000') >
      Date.now() - 14 * 24 * 60 * 60 * 1000;

    return {
      channelInfo: { ...channelData!.channelInfo, peerId: partnerId },
      partnerInfo: {
        userName: partnerInfo.userName,
        userId: partnerInfo.userId,
        avatarId: partnerInfo.avaId,
        age: partnerInfo.age,
        about: partnerInfo.abt ?? '',
        oftenVisitTime: partnerInfo.oftenVisitTime ?? '未設定',
        job: partnerInfo.job ?? '未設定',
        looks: partnerInfo.looks ?? '未設定',
        holidays: partnerInfo.holidays ?? '未設定',
        hometown: partnerInfo.hometown ?? '未設定',
        bloodType: partnerInfo.bloodType ?? '未設定',
        housemate: partnerInfo.housemate ?? '未設定',
        alcohol: partnerInfo.alcohol ?? '未設定',
        smokingStatus: partnerInfo.smokingStatus ?? '未設定',
        constellation: partnerInfo.constellation ?? '未設定',
        hobby: hobby(partnerInfo?.inters),
        bodyType: bodyType(partnerInfo.bdyTpe?.[0] ?? 0),
        marriageHistory: marriageHistory(partnerInfo.marriageHistory),
        personality: personality(partnerInfo.personalities),
        region: region(partnerInfo.region),
        showingFace: showingFace(partnerInfo.showingFaceStatus),
        stepToCall: stepToCall(partnerInfo.stepToCall),
        talkTheme: talkTheme(partnerInfo.talkTheme),
        lastLoginTime: partnerInfo.lastLoginTimeFromUserCollection,
        isNewUser: isNewUser,
        hasLovense: partnerInfo.hasLovense ?? false,
        ...(partnerInfo.bustSize ? { bustSize: partnerInfo.bustSize } : {}),
      },
    };
  }

  async getIncomingCallData(
    partnerId: string,
    _callType: CallType,
  ): Promise<IncomingCallData> {
    const { authOptions } = await import(
      '@/app/api/auth/[...nextauth]/options'
    );
    const session = await getServerSession(authOptions);
    const token = session?.user?.token;
    const myUserId = session?.user?.id;

    if (!token) throw new Error('token is required');

    const targetThumbnailRequest = {
      api: 'second_apps_target_user_list_thumbnail_for_web',
      target_user_id: partnerId,
    };

    const myUserInfoRequest = {
      api: 'get_user_inf',
      token: token,
    };

    const partnerInfoRequest = {
      api: 'get_user_inf_for_web',
      user_id: myUserId,
      req_user_id: partnerId,
    };

    const [
      { code: thumbnailCode, data: thumbnailData },
      { code: userCode, data: userData },
      { code: myUserInfoCode, data: myUserData },
    ] = await Promise.all([
      this.client.post<APIResponse<Thumbnail[]>>(
        this.apiUrl,
        targetThumbnailRequest,
      ),
      this.client.post<APIResponse<PartnerInfoResponse>>(
        this.apiUrl,
        partnerInfoRequest,
      ),
      this.client.post<APIResponse<MyUserInfoResponse>>(
        this.apiUrl,
        myUserInfoRequest,
      ),
    ]);

    if (userCode !== 0 || !userData) {
      console.error(
        `[CallService] getIncomingCallData user info error: code=${userCode}, partnerId=${partnerId}, hasData=${!!userData}`,
      );
      throw new Error('相手のユーザー情報を取得できませんでした');
    }

    const partnerInfo = userData;

    const isNewUser =
      convertToSentTime(partnerInfo.regDate ?? '202301010000') >
      Date.now() - 14 * 24 * 60 * 60 * 1000;

    return {
      channelInfo: { userCount: 0, peerId: partnerId },
      partnerInfo: {
        userName: partnerInfo.userName,
        userId: partnerInfo.userId,
        avatarId: partnerInfo.avaId,
        age: partnerInfo.age,
        about: partnerInfo.abt ?? '',
        videoCallWaiting: partnerInfo.videoCallWaiting,
        voiceCallWaiting: partnerInfo.voiceCallWaiting,
        oftenVisitTime: partnerInfo.oftenVisitTime ?? '未設定',
        job: partnerInfo.job ?? '未設定',
        looks: partnerInfo.looks ?? '未設定',
        holidays: partnerInfo.holidays ?? '未設定',
        hometown: partnerInfo.hometown ?? '未設定',
        bloodType: partnerInfo.bloodType ?? '未設定',
        housemate: partnerInfo.housemate ?? '未設定',
        alcohol: partnerInfo.alcohol ?? '未設定',
        smokingStatus: partnerInfo.smokingStatus ?? '未設定',
        constellation: partnerInfo.constellation ?? '未設定',
        hobby: hobby(partnerInfo?.inters),
        bodyType: bodyType(partnerInfo.bdyTpe?.[0] ?? 0),
        marriageHistory: marriageHistory(partnerInfo.marriageHistory),
        personality: personality(partnerInfo.personalities),
        region: region(partnerInfo.region),
        showingFace: showingFace(partnerInfo.showingFaceStatus),
        stepToCall: stepToCall(partnerInfo.stepToCall),
        talkTheme: talkTheme(partnerInfo.talkTheme),
        lastLoginTime: partnerInfo.lastLoginTimeFromUserCollection,
        isNewUser: isNewUser,
        applicationId: partnerInfo.applicationId,
        hasLovense: partnerInfo.hasLovense ?? false,
        ...(partnerInfo.bustSize ? { bustSize: partnerInfo.bustSize } : {}),
      },
      thumbnailList: thumbnailData
        ? thumbnailData
            .map((data) => convertToMediaInfo(data))
            .sort((a, _b) => (a.type === 'movie' ? -1 : 1))
        : [],
      point: myUserData?.point ?? 0,
      isBookmarked: partnerInfo.bookmark ?? false,
    };
  }

  async endedCallNotification(
    request: EndedCallNotificationRequest,
  ): Promise<EndedCallNotificationResponse> {
    try {
      const jamboRequest = endedCallNotificationRequest(
        request.channelName,
        request.callType,
        request.requestUserId,
        request.partnerUserId,
        request.duration,
      );

      const { code } = await this.client.post<
        APIResponse<EndedCallNotificationJamboResponse>
      >(this.apiUrl, jamboRequest);

      // code 0: 成功、code 2: API仕様上のエラー
      if (code === 0) {
        return { type: 'success' };
      }

      return {
        type: 'error',
        message:
          code === 2
            ? ENDED_CALL_NOTIFICATION_ERROR_MESSAGES.SEND_FAILED // 仕様上の既知のエラー
            : ENDED_CALL_NOTIFICATION_ERROR_MESSAGES.UNKNOWN_ERROR, // 予期しないエラー
      };
    } catch (error) {
      console.error('Failed to send ended call notification:', error);
      return {
        type: 'error',
        message: ENDED_CALL_NOTIFICATION_ERROR_MESSAGES.EXCEPTION,
      };
    }
  }
}

export class ClientCallService implements CallService {
  constructor(private readonly client: HttpClient) {}

  async getOutgoingCallData(
    partnerId: string,
    _callType: CallType,
  ): Promise<OutgoingCallData> {
    if (!partnerId) throw new Error('partnerId is required');
    throw new Error('Client-side call data fetching not implemented');
  }

  async getIncomingCallData(
    _partnerId: string,
    _callType: CallType,
  ): Promise<IncomingCallData> {
    throw new Error('Client-side call data fetching not implemented');
  }

  async checkAndPayForCall(
    apiName: string,
    duration: number,
    partnerId: string,
  ): Promise<CheckPayResult> {
    try {
      const response = await this.client.post<{
        type: 'success' | 'error';
        myPoint: number;
        broadcasterPoint: number;
        isFirstCourseBonusExist?: boolean;
        isSecondCourseBonusExist?: boolean;
        isThirdCourseBonusExist?: boolean;
        isFourthCourseBonusExist?: boolean;
        isFifthCourseBonusExist?: boolean;
        isCreditLogExist?: boolean;
        message?: string;
        code?: number;
        errorType?: 'data_missing' | 'server_error';
      }>(apiName, {
        duration: duration,
        partnerId: partnerId,
      });

      if (response.type === 'error') {
        // エラーログを送信（code の有無に関わらず常に送信）
        fetch('/api/log/call', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            partnerId: partnerId,
            code: response.code ?? 'unknown',
            message: response.message,
            duration: duration,
            callType: apiName,
          }),
        }).catch((error) => {
          console.error('Failed to send error log:', error);
        });

        // code: 70（ポイント不足）の場合は、APIから返された元のメッセージをそのまま使用
        if (response.code === 70) {
          throw new Error(response.message ?? 'ポイントが足りません', {
            cause: { code: response.code, message: response.message },
          });
        }

        const codeText =
          response.code !== undefined && response.code !== null
            ? response.code
            : 'unknown';
        const errorType: 'data_missing' | 'server_error' =
          response.errorType ??
          (response.code === 0 ? 'data_missing' : 'server_error');
        throw new Error(
          `通信エラーが発生しました。通信環境をお確かめの上再度お試し下さい。 code: ${codeText}`,
          {
            cause: {
              errorType,
              code: response.code,
              message: response.message,
            },
          },
        );
      }

      return {
        myPoint: response.myPoint,
        broadcasterPoint: response.broadcasterPoint,
        isFirstCourseBonusExist: response.isFirstCourseBonusExist ?? false,
        isSecondCourseBonusExist: response.isSecondCourseBonusExist ?? false,
        isThirdCourseBonusExist: response.isThirdCourseBonusExist ?? false,
        isFourthCourseBonusExist: response.isFourthCourseBonusExist ?? false,
        isFifthCourseBonusExist: response.isFifthCourseBonusExist ?? false,
        isCreditLogExist: response.isCreditLogExist ?? false,
      };
    } catch (error) {
      // ネットワークエラーなどの場合もログを送信
      fetch('/api/log/call', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          partnerId: partnerId,
          code: 999, // ネットワークエラーコード
          message: error instanceof Error ? error.message : 'Unknown error',
          duration: duration,
          callType: apiName,
        }),
      }).catch((logError) => {
        console.error('Failed to send error log:', logError);
      });

      throw error;
    }
  }

  async endedCallNotification(
    request: EndedCallNotificationRequest,
  ): Promise<EndedCallNotificationResponse> {
    try {
      const response = await this.client.post<EndedCallNotificationResponse>(
        ENDED_CALL_NOTIFICATION,
        request,
      );

      return response;
    } catch (error) {
      console.error('Failed to send ended call notification:', error);
      return {
        type: 'error',
        message: ENDED_CALL_NOTIFICATION_ERROR_MESSAGES.EXCEPTION,
      };
    }
  }
}

export function createCallService(client: HttpClient): CallService {
  if (client.getContext() === Context.SERVER) {
    return new ServerCallService(client);
  } else {
    return new ClientCallService(client);
  }
}
