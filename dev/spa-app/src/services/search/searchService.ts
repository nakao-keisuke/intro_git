import { getServerSession } from 'next-auth';
import {
  loginMeetPeopleRequest,
  type MeetPeopleResponseData,
} from '@/apis/utage-web-get-meet-people-exclude-video-call-channeler';
import type { HttpClient } from '@/libs/http/HttpClient';
import { type APIResponse, Context } from '@/libs/http/type';
import { bodyTypeList } from '@/utils/bodyType';
import {
  type MarriageStatus,
  marriageHistoryNumber,
} from '@/utils/marriageHistory';
import { processRegionParameter, region } from '@/utils/region';
import type { User } from '../shared/type';
import type { SearchParams, SearchResponse } from './type';

export interface SearchService {
  searchUsers: (params: SearchParams) => Promise<SearchResponse>;
}

const getAgeRange = (ageLabel: string): { lower: number; upper: number } => {
  const ageMap: { [key: string]: { lower: number; upper: number } } = {
    '0': { lower: 18, upper: 100 },
    '1': { lower: 18, upper: 20 },
    '2': { lower: 21, upper: 25 },
    '3': { lower: 26, upper: 30 },
    '4': { lower: 31, upper: 35 },
    '5': { lower: 36, upper: 40 },
    '6': { lower: 41, upper: 45 },
    '7': { lower: 46, upper: 100 },
  };

  return ageMap[ageLabel] || { lower: 0, upper: 100 };
};

export class ServerSearchService implements SearchService {
  constructor(
    private readonly client: HttpClient,
    private readonly apiUrl: string = import.meta.env.API_URL || '',
  ) {}

  async searchUsers(params: SearchParams): Promise<SearchResponse> {
    const { authOptions } = await import(
      '@/app/api/auth/[...nextauth]/options'
    );
    const session = await getServerSession(authOptions);

    let lower = 0,
      upper = 100;
    const regionIndices: number[] = [];
    const bodytypeIndices: number[] = [];
    const marriageHistoryIndices: number[] = [];
    let voiceCalling: boolean | undefined;
    let videoCalling: boolean | undefined;
    let faceSetting: boolean | undefined;
    const hasLovenseFilter = params.lovense === 'true' ? true : undefined;
    let bustSizeFilter: string | undefined;
    let isBigBreastsFilter: boolean | undefined;

    if (params.bustSize) {
      bustSizeFilter = params.bustSize;
    }

    if (params.bigBreasts) {
      isBigBreastsFilter = params.bigBreasts === 'true';
    }

    const minAge = params.minAge ? parseInt(params.minAge, 10) : undefined;
    const maxAge = params.maxAge ? parseInt(params.maxAge, 10) : undefined;
    const hasAgeRange = Number.isFinite(minAge) || Number.isFinite(maxAge);

    if (hasAgeRange) {
      lower = Number.isFinite(minAge) ? (minAge as number) : lower;
      upper = Number.isFinite(maxAge) ? (maxAge as number) : upper;
    } else if (params.age) {
      const ageRange = getAgeRange(params.age);
      lower = ageRange.lower;
      upper = ageRange.upper;
    }

    if (params.region) {
      const result = processRegionParameter(params.region);
      if (result.error) {
        return { type: 'error', message: result.error };
      }
      regionIndices.push(...result.regionIndices);
    }

    if (params.voice) {
      voiceCalling = params.voice === 'true';
    }

    if (params.video) {
      videoCalling = params.video === 'true';
    }

    if (params.face) {
      if (params.face === '0') {
        faceSetting = undefined;
      } else if (params.face === '1') {
        faceSetting = false;
      } else {
        faceSetting = true;
      }
    }

    if (params.bodyType?.length) {
      const invalidIndex = params.bodyType.find(
        (index) => index < 0 || index >= bodyTypeList.length,
      );

      if (invalidIndex !== undefined) {
        return {
          type: 'error',
          message: '体型設定が無効です',
        };
      }

      bodytypeIndices.push(...params.bodyType);
    }

    if (params.marriageHistory) {
      const marriageHistoryIndexArray = marriageHistoryNumber(
        params.marriageHistory as MarriageStatus,
      );
      if (marriageHistoryIndexArray.length > 0) {
        marriageHistoryIndices.push(...marriageHistoryIndexArray);
      } else {
        return {
          type: 'error',
          message: '結婚歴設定が無効です。',
        };
      }
    }

    const meetPeopleRequestParams = {
      ...loginMeetPeopleRequest,
      lower_age: lower,
      upper_age: upper,
      region: regionIndices.length > 0 ? regionIndices : undefined,
      voice_call_waiting: voiceCalling,
      video_call_waiting: videoCalling,
      showing_face: faceSetting,
      bdy_tpe: bodytypeIndices.length > 0 ? bodytypeIndices : undefined,
      marriage_history:
        marriageHistoryIndices.length > 0 ? marriageHistoryIndices : undefined,
      user_name: params.name,
      has_lovense: hasLovenseFilter,
      is_new: params.newUser === 'true' || undefined,
      bust_size: bustSizeFilter,
      is_big_breasts: isBigBreastsFilter,
      is_flea_market_on_sale: params.fleaMarket === 'true' || undefined,
    };

    try {
      const response = await this.client.post<APIResponse<User[]>>(
        this.apiUrl,
        meetPeopleRequestParams,
      );

      if (response.code !== 0 || !response.data) {
        return {
          type: 'error',
          message: 'サーバーの不明なエラーが発生しました。',
        };
      }

      let filteredData = response.data ?? [];

      if (params.lovense === 'true') {
        filteredData = filteredData.filter((person) => person.hasLovense);
      }

      if (params.newUser === 'true') {
        filteredData = filteredData.filter((person) => person.isNewUser);
      }

      if (params.fleaMarket === 'true') {
        filteredData = filteredData.filter(
          (person) => person.isListedOnFleaMarket === true,
        );
      }

      return {
        searchMeetPeopleList: filteredData.map((person) => ({
          userName: person.userName,
          userId: person.userId,
          avatarId: person.avaId,
          age: person.age,
          about: person.abt ?? '',
          region: region(person.region),
          isLoggedIn: !!session,
          lastLoginTime: person.lastLoginTime,
          videoCallWaiting: person.videoCallWaiting ?? false,
          voiceCallWaiting: person.voiceCallWaiting ?? false,
          isNewUser: person.isNewUser,
          isCalling: person.isCalling,
          hasStory: person.hasStoryMovie,
          thumbnailList: [],
          hasLovense: person.hasLovense ?? false,
          isListedOnFleaMarket: person.isListedOnFleaMarket ?? false,
        })),
        type: 'success',
      };
    } catch (error) {
      console.error('Error fetching data:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';
      return {
        type: 'error',
        message: `ユーザーデータの取得に失敗しました。エラー: ${errorMessage}`,
      };
    }
  }
}

export class ClientSearchService implements SearchService {
  constructor(
    private readonly client: HttpClient,
    private readonly apiUrl: string = import.meta.env.VITE_JAMBO_API_URL ||
      '',
  ) {}

  async searchUsers(params: SearchParams): Promise<SearchResponse> {
    if (
      !params.age &&
      !params.minAge &&
      !params.maxAge &&
      !params.region &&
      !params.voice &&
      !params.video &&
      !params.face &&
      !params.bodyType &&
      !params.marriageHistory &&
      !params.name &&
      !params.lovense &&
      !params.bustSize &&
      !params.bigBreasts &&
      !params.newUser &&
      !params.fleaMarket
    ) {
      return {
        type: 'error',
        message: '検索条件が未登録です',
      };
    }

    let lower = 0,
      upper = 100;
    const regionIndices: number[] = [];
    const bodytypeIndices: number[] = [];
    const marriageHistoryIndices: number[] = [];
    let voiceCalling: boolean | undefined;
    let videoCalling: boolean | undefined;
    let faceSetting: boolean | undefined;
    const hasLovenseFilter = params.lovense === 'true' ? true : undefined;
    let bustSizeFilter: string | undefined;
    let isBigBreastsFilter: boolean | undefined;

    if (params.bustSize) {
      bustSizeFilter = params.bustSize;
    }

    if (params.bigBreasts) {
      isBigBreastsFilter = params.bigBreasts === 'true';
    }

    const minAge = params.minAge ? parseInt(params.minAge, 10) : undefined;
    const maxAge = params.maxAge ? parseInt(params.maxAge, 10) : undefined;
    const hasAgeRange = Number.isFinite(minAge) || Number.isFinite(maxAge);

    if (hasAgeRange) {
      lower = Number.isFinite(minAge) ? (minAge as number) : lower;
      upper = Number.isFinite(maxAge) ? (maxAge as number) : upper;
    } else if (params.age) {
      const ageRange = getAgeRange(params.age);
      lower = ageRange.lower;
      upper = ageRange.upper;
    }

    if (params.region) {
      const result = processRegionParameter(params.region);
      if (result.error) {
        return { type: 'error', message: result.error };
      }
      regionIndices.push(...result.regionIndices);
    }

    if (params.voice) {
      voiceCalling = params.voice === 'true';
    }

    if (params.video) {
      videoCalling = params.video === 'true';
    }

    if (params.face) {
      if (params.face === '0') {
        faceSetting = undefined;
      } else if (params.face === '1') {
        faceSetting = false;
      } else {
        faceSetting = true;
      }
    }

    if (params.bodyType?.length) {
      const invalidIndex = params.bodyType.find(
        (index) => index < 0 || index >= bodyTypeList.length,
      );

      if (invalidIndex !== undefined) {
        return {
          type: 'error',
          message: '体型設定が無効です',
        };
      }

      bodytypeIndices.push(...params.bodyType);
    }

    if (params.marriageHistory) {
      const marriageHistoryIndexArray = marriageHistoryNumber(
        params.marriageHistory as MarriageStatus,
      );
      if (marriageHistoryIndexArray.length > 0) {
        marriageHistoryIndices.push(...marriageHistoryIndexArray);
      } else {
        return {
          type: 'error',
          message: '結婚歴設定が無効です。',
        };
      }
    }

    const meetPeopleRequestParams = {
      ...loginMeetPeopleRequest,
      lower_age: lower,
      upper_age: upper,
      region: regionIndices.length > 0 ? regionIndices : undefined,
      voice_call_waiting: voiceCalling,
      video_call_waiting: videoCalling,
      showing_face: faceSetting,
      bdy_tpe: bodytypeIndices.length > 0 ? bodytypeIndices : undefined,
      marriage_history:
        marriageHistoryIndices.length > 0 ? marriageHistoryIndices : undefined,
      name: params.name,
      has_lovense: hasLovenseFilter,
      is_new: params.newUser === 'true' || undefined,
      bust_size: bustSizeFilter,
      is_big_breasts: isBigBreastsFilter,
      is_flea_market_on_sale: params.fleaMarket === 'true' || undefined,
    };

    try {
      const response = await this.client.post<
        APIResponse<MeetPeopleResponseData[]>
      >(this.apiUrl, meetPeopleRequestParams);

      if (response.code !== 0 || !response.data) {
        return {
          type: 'error',
          message: 'サーバーの不明なエラーが発生しました。',
        };
      }

      let filteredData = [...response.data];

      if (params.name) {
        filteredData = filteredData.filter((person) =>
          person.user_name.includes(params.name!),
        );
      }

      if (params.lovense === 'true') {
        filteredData = filteredData.filter((person) => person.has_lovense);
      }

      if (params.newUser === 'true') {
        filteredData = filteredData.filter((person) => person.is_new_user);
      }

      if (params.fleaMarket === 'true') {
        filteredData = filteredData.filter(
          (person) => person.is_listed_on_flea_market === true,
        );
      }

      return {
        searchMeetPeopleList: filteredData.map((person) => ({
          userName: person.user_name,
          userId: person.user_id,
          avatarId: person.ava_id,
          age: person.age,
          about: person.abt ?? '',
          region: region(person.region),
          isLoggedIn: true,
          lastLoginTime: person.last_login_time,
          videoCallWaiting: person.video_call_waiting ?? false,
          voiceCallWaiting: person.voice_call_waiting ?? false,
          isNewUser: person.is_new_user,
          isCalling: person.is_calling,
          hasStory: person.has_story_movie,
          thumbnailList: [],
          hasLovense: person.has_lovense ?? false,
          isListedOnFleaMarket: person.is_listed_on_flea_market ?? false,
        })),
        type: 'success',
      };
    } catch (error) {
      console.error('Error fetching data:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';
      return {
        type: 'error',
        message: `ユーザーデータの取得に失敗しました。エラー: ${errorMessage}`,
      };
    }
  }
}

export function createSearchService(client: HttpClient): SearchService {
  if (client.getContext() === Context.SERVER) {
    return new ServerSearchService(client);
  } else {
    return new ClientSearchService(client);
  }
}
