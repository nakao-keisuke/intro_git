import type { ErrorData, ResponseData } from '@/types/NextApi';

// 成功時の共通ペイロード（dataは任意）
export type ApiRouteData<
  TData = unknown,
  TCode extends string | number = string | number,
> = {
  readonly success?: boolean;
  readonly data?: TData;
  readonly message?: string;
  readonly code?: TCode;
};

// クライアント⇔Route Handlerの統一レスポンス
// - 成功: ApiRouteData<T>
// - 失敗: ErrorData（NextApi.tsの定義）
export type ApiRouteResponse<
  TData = unknown,
  TCode extends string | number = string | number,
> = ResponseData<ApiRouteData<TData, TCode>>;

// 必要に応じて利用側でErrorDataを参照できるよう再エクスポート
export type ApiRouteError<TCode extends string | number = string | number> =
  ErrorData & {
    readonly code?: TCode;
  };
