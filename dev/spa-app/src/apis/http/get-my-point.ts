import { JAMBO_API_ROUTE } from '@/constants/jamboApiRoute';
import type { JamboRequest, JamboResponseData } from '@/types/JamboApi';
import type { ResponseData } from '@/types/NextApi';

// Request (snake_case)
interface GetMyPointRequest extends JamboRequest {
  readonly api: typeof JAMBO_API_ROUTE.GET_USER_INFO;
  readonly token: string;
}

// Upstream Response (jambo-serverから返却されるデータ)
export interface GetMyPointUpstreamResponse extends JamboResponseData {
  readonly point: number;
}

// Response (CamelCase) - クライアントに返却される最終的なレスポンス型
export interface GetMyPointResponse {
  readonly point: number;
}

// Route Response (Next.js Route Handler用のレスポンス)
export type GetMyPointRouteResponse = ResponseData<GetMyPointResponse>;

export function createGetMyPointRequest(token: string): GetMyPointRequest {
  return {
    api: JAMBO_API_ROUTE.GET_USER_INFO,
    token: token,
  };
}
