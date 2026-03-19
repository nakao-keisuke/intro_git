import type {
  ConversationListResponse,
  ConversationMessage,
} from '@/services/conversation/type';
import type {
  LiveChannels,
  Broadcaster as SharedBroadcaster,
  ChannelInfo as SharedChannelInfo,
} from '@/services/shared/type';
import type { NewChat } from '@/types/NewChat';
import { lastMessage, parseLastMessage } from '@/utils/messageUtil';
import { isValid as isValidUserId } from '@/utils/mongodb';
import { region as regionName, regionNumber } from '@/utils/region';
import type {
  BookmarkStreamInfoResponse,
  QuickJoinBookmarkStreamInfo,
  RawConversationItem,
  TaskKey,
  UtagePollingItem,
} from './types';

// JamboResponse 風オブジェクトから data を安全に取り出す
function hasDataProp(x: unknown): x is { data: unknown } {
  return (
    typeof x === 'object' &&
    x !== null &&
    'data' in (x as Record<string, unknown>)
  );
}
function unwrapData<T = unknown>(raw: unknown): T | unknown {
  if (hasDataProp(raw)) {
    return (raw as { data: unknown }).data as T;
  }
  return raw as T;
}

// LiveChannels 型ガード（浅い検査）
function isObject(x: unknown): x is Record<string, unknown> {
  return typeof x === 'object' && x !== null;
}
function isLiveChannels(x: unknown): x is LiveChannels {
  if (!isObject(x)) return false;
  const inLive = (x as Record<string, unknown>).inLiveList;
  const standby = (x as Record<string, unknown>).standbyList;
  return Array.isArray(inLive) && Array.isArray(standby);
}

export function normalizePollingData(
  key: TaskKey,
  raw: unknown,
  _params?: Record<string, unknown>,
): unknown {
  try {
    switch (key) {
      case 'unreadCount': {
        const d = unwrapData(raw);
        let num = 0;
        if (typeof d === 'number') {
          num = d;
        } else if (
          d &&
          typeof d === 'object' &&
          'unreadNum' in d &&
          typeof (d as { unreadNum: unknown }).unreadNum === 'number'
        ) {
          num = (d as { unreadNum: number }).unreadNum;
        }
        return num;
      }
      case 'liveUsers': {
        const d = unwrapData(raw);
        if (isLiveChannels(d)) {
          return d;
        }
        const empty: LiveChannels = { inLiveList: [], standbyList: [] };
        return empty;
      }
      case 'myPoint': {
        const d = unwrapData(raw);
        let point = 0;
        if (
          d &&
          typeof d === 'object' &&
          'point' in d &&
          typeof (d as { point: unknown }).point === 'number'
        ) {
          point = (d as { point: number }).point;
        }
        return { point };
      }
      case 'listConversation': {
        const d = unwrapData(raw);
        const arr: RawConversationItem[] = Array.isArray(d) ? d : [];
        const messages: ConversationMessage[] = arr.map((item) => {
          const rg =
            typeof item?.region === 'number'
              ? regionName(item.region)
              : typeof item?.region === 'string'
                ? (item.region as string).trim()
                : '';

          const formattedLastMsg = lastMessage(
            item?.msgType ?? '',
            item?.lastMsg ?? '',
            item?.isOwn ?? false,
          );

          const msg: ConversationMessage = {
            frdId: item?.frdId ?? '',
            frdName: item?.frdName ?? '',
            age: item?.age ?? 0, // age のデフォルト値を設定
            region: rg,
            isOnline: item?.isOnline ?? false,
            lastMsg: formattedLastMsg,
            isOwn: item?.isOwn ?? false,
            sentTime: item?.sentTime ?? '',
            timeStamp: item?.timeStamp ?? '',
            unreadNum: item?.unreadNum ?? 0,
            avaId: item?.avaId ?? '',
            gender: item?.gender ?? 0, // gender のデフォルト値を設定
            ...(item?.msgType && { msgType: item.msgType }),
            voiceCallWaiting: item?.voiceCallWaiting ?? false,
            videoCallWaiting: item?.videoCallWaiting ?? false,
            ...(item?.oneBeforeMsgType && {
              oneBeforeMsgType: item.oneBeforeMsgType,
            }),
            isNewUser: item?.isNewUser ?? false,
            hasLovense: item?.hasLovense ?? false,
            isListedOnFleaMarket: item?.isListedOnFleaMarket ?? false,
          };

          return msg;
        });

        const normalized: ConversationListResponse = {
          messages,
          hasMore: true,
        };

        return normalized;
      }
      case 'incomingCall': {
        // senderId バリデーション: "noposter" 等の無効値は着信なしとして扱う
        const data = unwrapData<Record<string, unknown>>(raw);
        if (
          isObject(data) &&
          typeof data.senderId === 'string' &&
          !isValidUserId(data.senderId)
        ) {
          return { code: 0, data: null };
        }
        return raw;
      }
      case 'utagePolling': {
        const rawData = unwrapData<UtagePollingItem[]>(raw);
        const pollingItems: UtagePollingItem[] = Array.isArray(rawData)
          ? rawData
          : [];
        // isOwnのフィルタリングのみ実行
        const filtered = pollingItems.filter((item) => !item.isOwn);

        // NewChat 型へ変換
        const mapped: NewChat[] = filtered.map((item) => {
          const partnerId = item.frdId;
          const ts = item.sentTime;
          const id = `${partnerId}-${ts}`;

          // isOwnは必ずfalse（フィルタリング済み）
          const parsedMessage = parseLastMessage(
            item.msgType,
            item.lastMsg,
            false,
          );
          const nc: NewChat = {
            id,
            partnerId,
            partnerName: item.frdName,
            lastMessage: parsedMessage.displayText,
            avatarId: item.avaId,
            timeStamp: ts,
            msgType: item.msgType,
            ...(parsedMessage.messageType === 'image' &&
              parsedMessage.fileId && { imageId: parsedMessage.fileId }),
            ...(parsedMessage.messageType === 'video' &&
              parsedMessage.fileId && { videoId: parsedMessage.fileId }),
            ...(parsedMessage.messageType === 'audio' &&
              parsedMessage.fileId && { audioId: parsedMessage.fileId }),
          };

          return nc;
        });

        // 受信順を保つため、sentTime 昇順に並べ替え
        mapped.sort((a, b) =>
          a.timeStamp < b.timeStamp ? -1 : a.timeStamp > b.timeStamp ? 1 : 0,
        );
        return mapped;
      }
      case 'bookmarkStreamInfo': {
        const d = unwrapData<BookmarkStreamInfoResponse>(
          raw,
        ) as BookmarkStreamInfoResponse;

        if (!d || !d.broadcaster || !d.channelInfo) {
          return null;
        }

        const b = d.broadcaster;
        const c = d.channelInfo;
        // Broadcaster（shared型）へ変換
        const sharedBroadcaster: SharedBroadcaster = {
          userId: b.userId,
          userName: b.userName,
          avaId: b.avaId,
          applicationId: b.applicationId,
          hasLovense: !!b.hasLovense,
          isBookMarked: !!b.bookmark,
          age: b.age ?? 0,
          // shared は number を期待。region が文字列（Region）の場合は数値に変換
          region:
            typeof b.region === 'number' ? b.region : regionNumber(b.region),
          showingFaceStatus: b.showingFaceStatus ?? 0,
          isVideoCallWaiting: !!b.videoChatWaiting,
          isVoiceCallWaiting: !!b.voiceCallWaiting,
          hLevel: b.hLevel ?? '',
          isLiveNow: true,
          isNewUser: !!b.isNewUser,
          abt: b.abt ?? '',
          inters: b.inters ?? [],
          // pollingのbdyTpeは string[] なので number[] に変換（不正値は0として扱う）
          bdyTpe: Array.isArray(b.bdyTpe)
            ? b.bdyTpe.map((v) => {
                const n = Number(v);
                return Number.isNaN(n) ? 0 : n;
              })
            : [],
          marriageHistory: b.marriageHistory ?? 0,
          personalities: b.personalities ?? [],
          stepToCall: b.stepToCall ?? 0,
          talkTheme: b.talkTheme ?? 0,
          lastLoginTime: b.lastLoginTime ?? '',
          oftenVisitTime: b.oftenVisitTime,
          looks: b.looks,
          holidays: b.holidays,
          hometown: b.hometown,
          bloodType: b.bloodType,
          housemate: b.housemate,
          alcohol: b.alcohol,
          // smokingStatus / constellation / job は polling Broadcaster には含まれないため未設定（sharedはoptional）
          bustSize: b.bustSize ?? '',
          ...(b.buzzLiveRecordingId && {
            buzzLiveRecordingId: b.buzzLiveRecordingId,
          }),
        };
        // ChannelInfo（shared型）へ変換
        const sharedChannelInfo: SharedChannelInfo = {
          channelId: c.channelId,
          broadcasterId: b.userId,
          callType: c.callType,
          channelType: c.channelType,
          thumbnailImageId: c.customThumbnailId || c.thumbnailImageId || '',
          userCount: c.userCount ?? null,
          rtcChannelToken: c.rtcChannelToken,
          appId: c.appId,
          rtmChannelToken: c.rtmChannelToken,
          ...(c.recordingId && { recordingId: c.recordingId }),
        };

        const normalized: QuickJoinBookmarkStreamInfo = {
          broadcaster: sharedBroadcaster,
          channelInfo: sharedChannelInfo,
        };

        return normalized;
      }
      default:
        return raw;
    }
  } catch (_e) {
    return raw;
  }
}
