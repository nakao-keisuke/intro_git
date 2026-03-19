import { getServerSession } from 'next-auth';
import {
  type GetPhoneVerificationStatusResponseData,
  getPhoneVerificationStatusRequest,
} from '@/apis/get-phone-verification-status';
import {
  HTTP_RESEND_PHONE_AUTH_CODE,
  HTTP_SEND_PHONE_AUTH_CODE,
  HTTP_VERIFY_PHONE_AUTH_CODE,
} from '@/constants/endpoints';
import type { HttpClient } from '@/libs/http/HttpClient';
import { type APIResponse, Context } from '@/libs/http/type';
import type { ResponseData } from '@/types/NextApi';
import type {
  PhoneVerificationStatus,
  SendPhoneAuthCodeRequest,
  SendPhoneAuthCodeResponse,
  VerifyPhoneAuthCodeRequest,
  VerifyPhoneAuthCodeResponse,
} from './type';

export interface PhoneVerificationService {
  getPhoneVerificationStatus: () => Promise<PhoneVerificationStatus>;
  sendPhoneAuthCode: (
    phoneNumber: string,
  ) => Promise<
    APIResponse<SendPhoneAuthCodeResponse | null> & { message?: string }
  >;
  resendPhoneAuthCode: (
    phoneNumber: string,
  ) => Promise<
    APIResponse<SendPhoneAuthCodeResponse | null> & { message?: string }
  >;
  verifyPhoneAuthCode: (
    phoneNumber: string,
    authCode: string,
  ) => Promise<
    APIResponse<VerifyPhoneAuthCodeResponse | null> & { message?: string }
  >;
}

export class ServerPhoneVerificationService
  implements PhoneVerificationService
{
  private readonly apiUrl: string = import.meta.env.API_URL!;

  constructor(private readonly client: HttpClient) {}

  async getPhoneVerificationStatus(): Promise<PhoneVerificationStatus> {
    const { authOptions } = await import(
      '@/app/api/auth/[...nextauth]/options'
    );
    const session = await getServerSession(authOptions);
    const token = session?.user?.token;

    if (!token) {
      return { isPhoneVerified: false };
    }

    const request = getPhoneVerificationStatusRequest(token);
    const response = await this.client.post<
      APIResponse<GetPhoneVerificationStatusResponseData>
    >(this.apiUrl, request);

    if (response.code || !response.data) {
      return { isPhoneVerified: false };
    }

    return {
      isPhoneVerified: response.data.verified,
    };
  }

  async sendPhoneAuthCode(
    phoneNumber: string,
  ): Promise<
    APIResponse<SendPhoneAuthCodeResponse | null> & { message?: string }
  > {
    const { authOptions } = await import(
      '@/app/api/auth/[...nextauth]/options'
    );
    const session = await getServerSession(authOptions);
    const token = session?.user?.token;

    if (!token) {
      return {
        code: 401,
        data: null,
        message: '認証が必要です',
      };
    }

    const response = await this.client.post<
      APIResponse<SendPhoneAuthCodeResponse | null> & { message?: string }
    >(HTTP_SEND_PHONE_AUTH_CODE, {
      phoneNumber,
    } as SendPhoneAuthCodeRequest);

    return response;
  }

  async resendPhoneAuthCode(
    phoneNumber: string,
  ): Promise<
    APIResponse<SendPhoneAuthCodeResponse | null> & { message?: string }
  > {
    const { authOptions } = await import(
      '@/app/api/auth/[...nextauth]/options'
    );
    const session = await getServerSession(authOptions);
    const token = session?.user?.token;

    if (!token) {
      return {
        code: 401,
        data: null,
        message: '認証が必要です',
      };
    }

    const response = await this.client.post<
      APIResponse<SendPhoneAuthCodeResponse | null> & { message?: string }
    >(HTTP_RESEND_PHONE_AUTH_CODE, {
      phoneNumber,
    } as SendPhoneAuthCodeRequest);

    return response;
  }

  async verifyPhoneAuthCode(
    phoneNumber: string,
    authCode: string,
  ): Promise<
    APIResponse<VerifyPhoneAuthCodeResponse | null> & { message?: string }
  > {
    const { authOptions } = await import(
      '@/app/api/auth/[...nextauth]/options'
    );
    const session = await getServerSession(authOptions);
    const token = session?.user?.token;

    if (!token) {
      return {
        code: 401,
        data: null,
        message: '認証が必要です',
      };
    }

    const response = await this.client.post<
      APIResponse<VerifyPhoneAuthCodeResponse | null> & { message?: string }
    >(HTTP_VERIFY_PHONE_AUTH_CODE, {
      phoneNumber,
      authCode,
    } as VerifyPhoneAuthCodeRequest);

    return response;
  }
}

export class ClientPhoneVerificationService
  implements PhoneVerificationService
{
  constructor(private readonly client: HttpClient) {}

  async getPhoneVerificationStatus(): Promise<PhoneVerificationStatus> {
    return { isPhoneVerified: false };
  }

  async sendPhoneAuthCode(
    phoneNumber: string,
  ): Promise<
    APIResponse<SendPhoneAuthCodeResponse | null> & { message?: string }
  > {
    const response = await this.client.post<ResponseData<{}>>(
      HTTP_SEND_PHONE_AUTH_CODE,
      {
        phoneNumber,
      } as SendPhoneAuthCodeRequest,
    );

    // APIレスポンスの形式を統一
    if (response.type === 'success') {
      return { code: 0, data: null };
    } else if (response.type === 'error') {
      return { code: 1, data: null, message: response.message };
    }

    // APIResponseの形式の場合
    return response as APIResponse<SendPhoneAuthCodeResponse | null> & {
      message?: string;
    };
  }

  async resendPhoneAuthCode(
    phoneNumber: string,
  ): Promise<
    APIResponse<SendPhoneAuthCodeResponse | null> & { message?: string }
  > {
    const response = await this.client.post<ResponseData<{}>>(
      HTTP_RESEND_PHONE_AUTH_CODE,
      {
        phoneNumber,
      } as SendPhoneAuthCodeRequest,
    );

    // APIレスポンスの形式を統一
    if (response.type === 'success') {
      return { code: 0, data: null };
    } else if (response.type === 'error') {
      return { code: 1, data: null, message: response.message };
    }

    // APIResponseの形式の場合
    return response as APIResponse<SendPhoneAuthCodeResponse | null> & {
      message?: string;
    };
  }

  async verifyPhoneAuthCode(
    phoneNumber: string,
    authCode: string,
  ): Promise<
    APIResponse<VerifyPhoneAuthCodeResponse | null> & { message?: string }
  > {
    const response = await this.client.post<ResponseData<{}>>(
      HTTP_VERIFY_PHONE_AUTH_CODE,
      {
        phoneNumber,
        authCode,
      } as VerifyPhoneAuthCodeRequest,
    );

    // APIレスポンスの形式を統一
    if (response.type === 'success') {
      return { code: 0, data: null };
    } else if (response.type === 'error') {
      return { code: 1, data: null, message: response.message };
    }

    // APIResponseの形式の場合
    return response as APIResponse<VerifyPhoneAuthCodeResponse | null> & {
      message?: string;
    };
  }
}

export function createPhoneVerificationService(
  client: HttpClient,
): PhoneVerificationService {
  if (client.getContext() === Context.SERVER) {
    return new ServerPhoneVerificationService(client);
  } else {
    return new ClientPhoneVerificationService(client);
  }
}
