import type { GetUtageWebBoardMessageResponseData } from '@/apis/get-utage-web-board-message';
import type { MeetPeopleResponseData } from '@/apis/utage-web-get-meet-people-exclude-video-call-channeler';
import { getPastTime } from '@/libs/date';
import { stepToCall } from './stepToCall';

export const extractInstantCallBoardList = (
  boardData: GetUtageWebBoardMessageResponseData[],
  meetPeopleData: MeetPeopleResponseData[],
) => {
  return Array.from(
    new Map(
      boardData
        ?.filter(
          (e: GetUtageWebBoardMessageResponseData) =>
            (e.video_call_waiting || e.voice_call_waiting) &&
            !meetPeopleData?.find((d) => d.user_id === e.user_id)?.is_calling &&
            !meetPeopleData?.find((d) => d.user_id === e.user_id)
              ?.is_live_now &&
            e.message.includes('いきなりかけてもらって大丈夫です') &&
            Number(getPastTime(12, 'yyyyMMddHHmmss', 'Asia/Tokyo')) <
              Number(e.created),
        )
        .map((item) => [item.user_id, item]) ?? [],
    ).values(),
  );
};

export const extractInstantCallMeetPeopleList = (
  data: MeetPeopleResponseData[],
) => {
  return Array.from(
    new Map(
      data
        ?.filter(
          (e) =>
            stepToCall(e.step_to_call) === 'いきなりかけてもらって大丈夫です' &&
            Number(getPastTime(30, 'yyyyMMddHHmmss')) <
              Number(e.last_login_time) &&
            (e.video_call_waiting || e.voice_call_waiting) &&
            !data?.find((d) => d.user_id === e.user_id)?.is_calling &&
            !data?.find((d) => d.user_id === e.user_id)?.is_live_now,
        )
        .map((item) => [item.user_id, item]) ?? [],
    ).values(),
  );
};
