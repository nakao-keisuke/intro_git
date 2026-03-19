import type { JamboRequest, JamboResponseData } from '@/types/JamboApi';

type VideochatCampaignRequest = JamboRequest & {
  api: 'get_second_apps_campaign_info';
  token: string;
  campaign_name?: string;
};

export type VideochatCampaignResponseData = JamboResponseData & {
  end_campaign_date?: string;
  total_earned_point_on_campaign?: number;
  start_campaign_date?: string;
  current_campaign?: string;
  has_story_movie?: boolean;
  is_on_campaign?: boolean;
  total_count_of_sending_present_menu?: number;
  total_consume_point_of_present_menu?: number;
};

export const campaignForFemaleRequest = (
  token: string,
): VideochatCampaignRequest => ({
  api: 'get_second_apps_campaign_info',
  token,
});

export const campaignForMaleRequest = (
  token: string,
): VideochatCampaignRequest => ({
  api: 'get_second_apps_campaign_info',
  token,
  campaign_name: '202405_male_campaign',
});
