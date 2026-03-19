import { JAMBO_API_ROUTE } from '@/constants/jamboApiRoute';
import type { APIRequest, APIResponse } from '@/libs/http/type';
import type { ApiRouteResponse } from '@/types/ApiRoute';

/**
 * Review posting condition status returned to the client.
 */
export type ReviewPostingEnabledData = {
  hasNotReviewed: boolean;
  isCallDurationEnough: boolean;
};

export type ReviewPostingEnabledRouteResponse =
  ApiRouteResponse<ReviewPostingEnabledData>;

/**
 * Jambo request payload for review posting eligibility.
 */
export type ReviewPostingEnabledRequest = APIRequest & {
  readonly api: typeof JAMBO_API_ROUTE.GET_REVIEW_POSTING_ENABLED;
  readonly token: string;
  readonly target_user_id: string;
};

/**
 * Jambo upstream response payload for review posting eligibility.
 */
export type ReviewPostingEnabledUpstreamResponse = APIResponse<{
  hasReviewed: boolean;
  enabled: boolean;
  conditions: string[];
}>;

export const createReviewPostingEnabledRequest = (
  token: string,
  targetUserId: string,
): ReviewPostingEnabledRequest => ({
  api: JAMBO_API_ROUTE.GET_REVIEW_POSTING_ENABLED,
  token,
  target_user_id: targetUserId,
});
