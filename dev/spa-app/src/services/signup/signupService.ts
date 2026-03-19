import {
  type RegisterForWebResponseData,
  registerForWebRequest,
} from '@/apis/register-for-web';
import {
  UNSEAL_FINGER_PRINT_DATA,
  UPDATE_CALL_WAITING,
} from '@/constants/endpoints';
import type { HttpClient } from '@/libs/http/HttpClient';
import type { APIResponse } from '@/libs/http/type';
import type { ResponseData } from '@/types/NextApi';
import type {
  RegisterUserParams,
  SignupActionResult,
  UnsealFingerprintRequest,
  UnsealFingerprintResponse,
  UnsealFingerprintResponseData,
  UpdateCallWaitingRequest,
  UpdateCallWaitingResponse,
} from './type';

// クライアント側のSignupService型
export type SignupService = {
  unsealFingerprintData: (
    sealedData: string,
  ) => Promise<SignupActionResult<UnsealFingerprintResponse>>;
  updateCallWaiting: (
    voiceCallWaiting: boolean,
    videoCallWaiting: boolean,
  ) => Promise<SignupActionResult<void>>;
};

// サーバー側のSignupService型
export type ServerSignupServiceType = {
  registerUser: (
    params: RegisterUserParams,
  ) => Promise<SignupActionResult<RegisterForWebResponseData>>;
};

// クライアント側の実装
export class ClientSignupService implements SignupService {
  constructor(private readonly client: HttpClient) {}

  /**
   * FingerprintJS の暗号化データを復号化
   * @param sealedData 暗号化されたFingerprintJSデータ
   * @returns 復号化結果
   */
  async unsealFingerprintData(
    sealedData: string,
  ): Promise<SignupActionResult<UnsealFingerprintResponse>> {
    try {
      const response = await this.client.post<
        ResponseData<UnsealFingerprintResponseData>
      >(UNSEAL_FINGER_PRINT_DATA, { sealedData } as UnsealFingerprintRequest);

      if (response.type === 'success') {
        return {
          success: true,
          data: (
            response as UnsealFingerprintResponseData & { type: 'success' }
          ).data,
        };
      } else if (response.type === 'error') {
        return {
          success: false,
          message: response.message || 'FingerprintJS復号化に失敗しました',
        };
      }

      // 予期しないレスポンス形式
      return {
        success: false,
        message: 'FingerprintJS復号化に失敗しました',
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * 通話待機設定を更新
   * @param voiceCallWaiting 音声通話待機状態
   * @param videoCallWaiting ビデオ通話待機状態
   * @returns 更新結果
   */
  async updateCallWaiting(
    voiceCallWaiting: boolean,
    videoCallWaiting: boolean,
  ): Promise<SignupActionResult<void>> {
    try {
      const response = await this.client.post<
        ResponseData<UpdateCallWaitingResponse>
      >(UPDATE_CALL_WAITING, {
        voiceCallWaiting,
        videoCallWaiting,
      } as UpdateCallWaitingRequest);

      if (response.type === 'success') {
        return {
          success: true,
        };
      } else if (response.type === 'error') {
        return {
          success: false,
          message: response.message || '通話待機設定の更新に失敗しました',
        };
      }

      // 予期しないレスポンス形式
      return {
        success: false,
        message: '通話待機設定の更新に失敗しました',
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}

// サーバー側の実装
export class ServerSignupService implements ServerSignupServiceType {
  private readonly apiUrl: string = import.meta.env.API_URL!;

  constructor(private readonly client: HttpClient) {}

  /**
   * ユーザー登録
   * @param params ユーザー登録パラメータ
   * @returns 登録結果
   */
  async registerUser(
    params: RegisterUserParams,
  ): Promise<SignupActionResult<RegisterForWebResponseData>> {
    try {
      const request = registerForWebRequest(
        params.name,
        params.age,
        params.region,
        params.cmCode,
        params.clientIp,
        params.webUUId,
        params.visitorId,
        params.applicationId,
        params.phoneNumber,
        params.password,
        params.googleAccountId,
        params.email,
        params.lineId,
        params.gclid,
        params.googleClientId,
      );

      const response = await this.client.post<
        APIResponse<RegisterForWebResponseData>
      >(this.apiUrl, request);

      if (response.code === 0 && response.data) {
        return {
          success: true,
          data: response.data,
        };
      } else {
        return {
          success: false,
          message: 'ユーザー登録に失敗しました',
        };
      }
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}

// Factory関数
export function createClientSignupService(client: HttpClient): SignupService {
  return new ClientSignupService(client);
}

export function createServerSignupService(
  client: HttpClient,
): ServerSignupServiceType {
  return new ServerSignupService(client);
}
