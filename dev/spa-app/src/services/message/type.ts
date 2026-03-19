import type { GetCreditPurchaseCourseResponseData } from '@/apis/get-credit-purchase-course-info';

// MessageService用の型定義
export type CreditPurchaseInfo = GetCreditPurchaseCourseResponseData;

// スタンプ送信リクエスト
export interface SendStickerRequest {
  partnerId: string;
  content: string;
}

// スタンプ送信レスポンス（必要に応じて拡張）
export interface SendStickerResponse {
  notEnoughPoint: boolean;
  type: string;
  message: string;
}

// 画像送信リクエスト
export interface SendImageRequest {
  partnerId: string;
  fileId: string;
}

// 画像送信レスポンス（必要に応じて拡張）
export interface SendImageResponse {
  notEnoughPoint: boolean;
  type: string;
  message: string;
}

// テキストメッセージ送信リクエスト
export interface SendTextMessageRequest {
  partnerId: string;
  content: string;
}

// テキストメッセージ送信レスポンス（必要に応じて拡張）
export interface SendTextMessageResponse {
  notEnoughPoint: boolean;
  type: string;
  message: string;
  messageId?: string;
  sentTime?: number;
  timeStamp?: string;
}

// 画像購入リクエスト
export interface PurchaseImageRequest {
  imageId: string;
}

// 画像購入レスポンス（必要に応じて拡張）
export interface PurchaseImageResponse {
  notEnoughPoint?: boolean;
  type?: string;
  message?: string;
}

// 動画購入リクエスト
export interface PurchaseVideoRequest {
  fileId: string;
}

// 動画購入レスポンス（必要に応じて拡張）
export interface PurchaseVideoResponse {
  notEnoughPoint?: boolean;
  type?: string;
  message?: string;
}

// 動画送信リクエスト
export interface SendVideoRequest {
  partnerId: string;
  fileId: string;
  duration: number;
}

// 動画送信レスポンス（必要に応じて拡張）
export interface SendVideoResponse {
  notEnoughPoint: boolean;
  type: string;
  message: string;
}
