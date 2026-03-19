import type { JamboRequest } from '@/types/JamboApi';

type GetVideoUsersRequest = JamboRequest & {
  readonly api: 'second_apps_get_recommended_live_users';
  readonly token: string;
};

export type GetVideoUsersResponseElementData = {
  readonly recommended_live_user_list: [
    {
      readonly last_action_status_color: string;
      readonly gender: number;
      readonly last_login_time: string;
      readonly is_new: boolean;
      readonly user_name: string;
      readonly last_action_status_label: string;
      readonly has_lovense: boolean;
      readonly online_status_color: string;
      readonly abt: string;
      readonly user_id: string;
      readonly online_status_label: string;
      readonly voice_call_waiting: boolean;
      readonly ava_id: string;
      readonly region: number;
      readonly age: number;
      readonly video_call_waiting: boolean;
      readonly talk_theme: number;
      readonly showing_face_status: number;
      readonly step_to_call: number;
    },
  ];
};

export const getVideoUsersRequest = (token: string): GetVideoUsersRequest => {
  return {
    api: 'second_apps_get_recommended_live_users',
    token: token,
  };
};
