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
  is_on_campaign?: boolean;
  total_count_of_sending_present_menu?: number;
  total_consume_point_of_present_menu?: number;
  video_chat_history?: {
    start_time: string;
    earned_point: number;
    video_chat_log_id: string;
    lovense_point: number;
  }[];
};

export const campaignForMaleRequest = (
  token: string,
): VideochatCampaignRequest => ({
  api: 'get_second_apps_campaign_info',
  token,
  campaign_name: '202406_lovense_ticket',
});

export type LovenseTicketResponseData = JamboResponseData & {
  is_on_campaign: boolean;
  can_get_roullete_ticket: boolean | null;
  ticket_lovense_menu_type: string | null;
  ticket_lovense_duration: string | null;
};
