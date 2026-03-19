import type { JamboRequest, JamboResponseData } from '@/types/JamboApi';

interface GetCategoryRankingForUtageWebRequest extends JamboRequest {
  readonly api: 'get_category_ranking_for_utage_web';
  readonly type: number;
}

export interface GetCategoryRankingForUtageWebResponseData
  extends JamboResponseData {
  readonly user: {
    readonly user_name: string;
    readonly voice_call_waiting: boolean;
    readonly video_call_waiting: boolean;
    readonly ava_id: string;
    readonly region: number;
    readonly age: number;
    readonly abt: string | undefined;
    readonly last_login_time: string;
    readonly is_new: boolean;
    readonly call_status: number;
    readonly last_action_status_label?: string;
    readonly is_listed_on_flea_market?: boolean;
  };
  readonly user_id: string;
  readonly rank: number;
  readonly is_sudden_rise: boolean;
  readonly has_lovense: boolean;
  readonly average_score: number | null;
  readonly review_count: number;
}

const RANKING_TYPE = {
  TOTAL: 0,
  TWO_SHOT: 1,
  VIDEO_CHAT: 2,
};

export function getCategoryRankingForUtageWebRequest(): GetCategoryRankingForUtageWebRequest {
  return {
    api: 'get_category_ranking_for_utage_web',
    type: RANKING_TYPE.TOTAL,
  };
}
export function getCategoryTotalRankingForUtageWebRequest(): GetCategoryRankingForUtageWebRequest {
  return {
    api: 'get_category_ranking_for_utage_web',
    type: RANKING_TYPE.TOTAL,
  };
}
