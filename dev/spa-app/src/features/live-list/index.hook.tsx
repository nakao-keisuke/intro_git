import type { GetServerSideProps } from 'next';
import {
  type UtageWebGetLiveChannelsResponseData,
  utageWebGetLiveChannelsRequest,
} from '@/apis/utage-web-get-live-channels';
import type { LiveChannel } from '@/types/LiveChannel';
import type { ResponseData } from '@/types/NextApi';
import { bodyType } from '@/utils/bodyType';
import type { CallType } from '@/utils/callView';
import { hobby } from '@/utils/hobby';
import { postToJambo } from '@/utils/jambo';
import { marriageHistory } from '@/utils/marriageHistory';
import { personality } from '@/utils/personality';
import { region } from '@/utils/region';
import { showingFace } from '@/utils/showingFace';
import { stepToCall } from '@/utils/stepToCall';
import { talkTheme } from '@/utils/talkTheme';

export const getServerSideProps: GetServerSideProps<{
  data: ResponseData<(LiveChannel & { type: CallType })[]>;
}> = async (context) => {
  const request = utageWebGetLiveChannelsRequest();
  const { code, data } = await postToJambo<UtageWebGetLiveChannelsResponseData>(
    request,
    context.req,
  );
  if (code)
    return {
      props: {
        data: { type: 'error', message: 'チャンネルの取得に失敗しました' },
      },
    };
  const standbyList = data.standbyList.map((e) => ({
    ...e,
    type: e.channelInfo.channel_id.includes('video')
      ? 'videoCallFromStandby'
      : 'live',
  }));
  const inLiveList = data.inLiveList.map((e) => ({
    ...e,
    type: 'live',
  }));
  const listData = standbyList.concat(inLiveList);

  return {
    props: {
      data: listData.map((e) => ({
        broadcaster: {
          userName: e.broadcaster.user_name,
          age: e.broadcaster.age,
          about: e.broadcaster.abt,
          avatarId: e.broadcaster.ava_id,
          userId: e.broadcaster.user_id,
          isNewUser: e.broadcaster.is_new_user,
          hobby: hobby(e.broadcaster.inters),
          bodyType: bodyType(e.broadcaster.bdy_tpe?.[0] ?? 0),
          marriageHistory: marriageHistory(e.broadcaster.marriage_history),
          personality: personality(e.broadcaster.personalities),
          region: region(e.broadcaster.region),
          showingFace: showingFace(e.broadcaster.showing_face_status),
          stepToCall: stepToCall(e.broadcaster.step_to_call),
          talkTheme: talkTheme(e.broadcaster.talk_theme),
          isLive: e.broadcaster.is_live_now,
          lastLoginTime: e.broadcaster.last_login_time,
          oftenVisitTime: e.broadcaster.often_visit_time ?? '未設定',
          job: e.broadcaster.job ?? '未設定',
          looks: e.broadcaster.looks ?? '未設定',
          holidays: e.broadcaster.holidays ?? '未設定',
          hometown: e.broadcaster.hometown ?? '未設定',
          bloodType: e.broadcaster.blood_type ?? '未設定',
          housemate: e.broadcaster.housemate ?? '未設定',
          alcohol: e.broadcaster.alcohol ?? '未設定',
          smokingStatus: e.broadcaster.smoking_status ?? '未設定',
          constellation: e.broadcaster.constellation ?? '未設定',
          hasLovense: e.broadcaster.has_lovense ?? false,
        },
        channelInfo: {
          rtcChannelToken: e.channelInfo.rtc_channel_token,
          appId: e.channelInfo.app_id,
          channelId: e.channelInfo.channel_id,
          userCount: e.channelInfo.user_count,
          thumbnailImageId: e.channelInfo.thumbnail_image_id,
        },
        type: e.type as CallType,
      })),
    },
  };
};
