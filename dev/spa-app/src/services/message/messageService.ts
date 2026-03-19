import { getServerSession } from 'next-auth';
import { getCreditPurchaseCourseInfoRequest } from '@/apis/get-credit-purchase-course-info';
import {
  CREDIT_PURCHASE_INFO,
  HTTP_SEND_IMAGE_MESSAGE,
  HTTP_SEND_STICKER,
  HTTP_SEND_TEXT_MESSAGE,
  HTTP_SEND_VIDEO_MESSAGE,
  PURCHASE_IMAGE,
  PURCHASE_VIDEO,
} from '@/constants/endpoints';
import type { HttpClient } from '@/libs/http/HttpClient';
import { type APIResponse, Context } from '@/libs/http/type';
import type {
  CreditPurchaseInfo,
  PurchaseImageRequest,
  PurchaseImageResponse,
  PurchaseVideoRequest,
  PurchaseVideoResponse,
  SendImageRequest,
  SendImageResponse,
  SendStickerRequest,
  SendStickerResponse,
  SendTextMessageRequest,
  SendTextMessageResponse,
  SendVideoRequest,
  SendVideoResponse,
} from './type';

// Service Interface
export interface MessageService {
  getCreditPurchaseInfo: () => Promise<CreditPurchaseInfo | null>;
  sendSticker: (
    partnerId: string,
    content: string,
  ) => Promise<APIResponse<SendStickerResponse>>;
  sendImage: (
    partnerId: string,
    fileId: string,
  ) => Promise<APIResponse<SendImageResponse>>;
  sendVideo: (
    partnerId: string,
    fileId: string,
    duration: number,
  ) => Promise<APIResponse<SendVideoResponse>>;
  sendTextMessage: (
    partnerId: string,
    content: string,
  ) => Promise<APIResponse<SendTextMessageResponse>>;
  purchaseImage: (
    imageId: string,
  ) => Promise<APIResponse<PurchaseImageResponse>>;
  purchaseVideo: (
    fileId: string,
  ) => Promise<APIResponse<PurchaseVideoResponse>>;
}

// Client実装（ブラウザ用）
export class ClientMessageService implements MessageService {
  constructor(private readonly client: HttpClient) {}

  async getCreditPurchaseInfo(): Promise<CreditPurchaseInfo | null> {
    try {
      // APIルートを経由してサーバー側で認証処理を行う
      const response = await this.client.post<CreditPurchaseInfo>(
        CREDIT_PURCHASE_INFO,
        {},
      );
      return response;
    } catch (error) {
      if (import.meta.env.NODE_ENV === 'development') {
        console.error('Failed to fetch credit purchase info:', error);
      }
      return null;
    }
  }

  async sendSticker(
    partnerId: string,
    content: string,
  ): Promise<APIResponse<SendStickerResponse>> {
    const request: SendStickerRequest = {
      partnerId,
      content,
    };

    return this.client.post<APIResponse<SendStickerResponse>>(
      HTTP_SEND_STICKER,
      request,
    );
  }

  async sendImage(
    partnerId: string,
    fileId: string,
  ): Promise<APIResponse<SendImageResponse>> {
    const request: SendImageRequest = {
      partnerId,
      fileId,
    };

    return this.client.post<APIResponse<SendImageResponse>>(
      HTTP_SEND_IMAGE_MESSAGE,
      request,
    );
  }

  async sendVideo(
    partnerId: string,
    fileId: string,
    duration: number,
  ): Promise<APIResponse<SendVideoResponse>> {
    const request: SendVideoRequest = {
      partnerId,
      fileId,
      duration,
    };

    return this.client.post<APIResponse<SendVideoResponse>>(
      HTTP_SEND_VIDEO_MESSAGE,
      request,
    );
  }

  async sendTextMessage(
    partnerId: string,
    content: string,
  ): Promise<APIResponse<SendTextMessageResponse>> {
    const request: SendTextMessageRequest = {
      partnerId,
      content,
    };

    return this.client.post<APIResponse<SendTextMessageResponse>>(
      HTTP_SEND_TEXT_MESSAGE,
      request,
    );
  }

  async purchaseImage(
    imageId: string,
  ): Promise<APIResponse<PurchaseImageResponse>> {
    const request: PurchaseImageRequest = {
      imageId,
    };

    return this.client.post<APIResponse<PurchaseImageResponse>>(
      PURCHASE_IMAGE,
      request,
    );
  }

  async purchaseVideo(
    fileId: string,
  ): Promise<APIResponse<PurchaseVideoResponse>> {
    const request: PurchaseVideoRequest = {
      fileId,
    };

    return this.client.post<APIResponse<PurchaseVideoResponse>>(
      PURCHASE_VIDEO,
      request,
    );
  }
}

// Server実装（必要に応じて実装）
export class ServerMessageService implements MessageService {
  private readonly apiUrl: string = import.meta.env.API_URL!;

  constructor(private readonly client: HttpClient) {}

  async getCreditPurchaseInfo(): Promise<CreditPurchaseInfo | null> {
    try {
      const { authOptions } = await import(
        '@/app/api/auth/[...nextauth]/options'
      );
      const session = await getServerSession(authOptions);
      const token = session?.user?.token;

      if (!token) {
        return null;
      }

      const request = getCreditPurchaseCourseInfoRequest(token);
      const { code, data } = await this.client.post<
        APIResponse<CreditPurchaseInfo>
      >(this.apiUrl, request);

      if (code !== 0 || !data) {
        console.error('[ERROR] getCreditPurchaseInfo failed - code:', code);
        return null;
      }

      return data;
    } catch (error) {
      console.error('[ERROR] getCreditPurchaseInfo exception:', error);
      return null;
    }
  }

  async sendSticker(
    _partnerId: string,
    _content: string,
  ): Promise<APIResponse<SendStickerResponse>> {
    // サーバー側での実装が必要な場合はここに実装
    throw new Error('Server-side sticker sending is not implemented');
  }

  async sendImage(
    _partnerId: string,
    _fileId: string,
  ): Promise<APIResponse<SendImageResponse>> {
    // サーバー側での実装が必要な場合はここに実装
    throw new Error('Server-side image sending is not implemented');
  }

  async sendVideo(
    _partnerId: string,
    _fileId: string,
    _duration: number,
  ): Promise<APIResponse<SendVideoResponse>> {
    // サーバー側での実装が必要な場合はここに実装
    throw new Error('Server-side video sending is not implemented');
  }

  async sendTextMessage(
    _partnerId: string,
    _content: string,
  ): Promise<APIResponse<SendTextMessageResponse>> {
    // サーバー側での実装が必要な場合はここに実装
    throw new Error('Server-side text message sending is not implemented');
  }

  async purchaseImage(
    _imageId: string,
  ): Promise<APIResponse<PurchaseImageResponse>> {
    // サーバー側での実装が必要な場合はここに実装
    throw new Error('Server-side image purchase is not implemented');
  }

  async purchaseVideo(
    _fileId: string,
  ): Promise<APIResponse<PurchaseVideoResponse>> {
    // サーバー側での実装が必要な場合はここに実装
    throw new Error('Server-side video purchase is not implemented');
  }
}

// Factory関数
export function createMessageService(client: HttpClient): MessageService {
  if (client.getContext() === Context.SERVER) {
    return new ServerMessageService(client);
  } else {
    return new ClientMessageService(client);
  }
}
