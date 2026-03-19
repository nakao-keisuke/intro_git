// ユーザー詳細情報
export type User = {
  userId: string;
  userName: string;
  voiceCallWaiting: boolean;
  videoCallWaiting: boolean;
  videoChatWaiting: boolean;
  point: number;
  avaId: string;
  region: number;
  age: number;
  abt: string | undefined;
  bdyTpe: number[];
  inters: number[];
  talkTheme: number;
  stepToCall: number;
  marriageHistory: number;
  showingFaceStatus: number;
  personalities: number[];
  lastLoginTime: string;
  regDate?: string;
  isFav: number;
  oftenVisitTime?: string;
  job?: string;
  looks?: string;
  holidays?: string;
  hometown?: string;
  bloodType?: string;
  housemate?: string;
  smokingStatus?: string;
  alcohol?: string;
  constellation?: string;
  bookmark: boolean;
  isNewUser: boolean;
  hasLovense?: boolean;
  bustSize?: string;
  hLevel?: string;
  applicationId: string;
  bonusFlag?: number;
  email?: string;
  isCalling: boolean;
  hasStoryMovie: boolean;
  gclid?: string;
  ga4ClientId?: string;
  isListedOnFleaMarket?: boolean;
};

// 探す画面のユーザー
export type MeetPeople = {
  userId: string;
  avaId: string;
  abt: string;
  age: number;
  userName: string;
  region: number;
  voiceCallWaiting: boolean;
  videoCallWaiting: boolean;
  isNewUser: boolean;
  isCalling: boolean;
  isLiveNow: boolean;
  lastLoginTime: string;
  hasStoryMovie: boolean;
  stepToCall: number;
  hasLovense: boolean;
  isListedOnFleaMarket: boolean;
  isFav?: number; // いいね済みフラグ (1: いいね済み, 0: 未いいね)
  bustSize?: string;
  averageScore?: number; // 平均評価スコア
  reviewCount?: number; // レビュー件数
};

// ライブチャンネル情報
export type LiveChannelInfo = {
  broadcaster: Broadcaster;
  channelInfo: ChannelInfo;
};

// チャンネル情報
export type ChannelInfo = {
  channelId: string;
  broadcasterId: string;
  callType: string;
  channelType: string;
  thumbnailImageId: string;
  userCount: number | null;
  // APIレスポンスの追加フィールド（ワンタップ入室に必要）
  rtcChannelToken?: string;
  appId?: string;
  rtmChannelToken?: string;
  // ライブ録画ID（動画サムネイル表示用）
  recordingId?: string;
};

// 配信者情報
export type Broadcaster = {
  userId: string;
  userName: string;
  avaId: string;
  applicationId: string;
  hasLovense: boolean;
  isBookMarked: boolean;
  age: number;
  region: number;
  showingFaceStatus: number;
  isVideoCallWaiting: boolean;
  isVoiceCallWaiting: boolean;
  hLevel: string;
  isLiveNow: boolean;
  isNewUser: boolean;
  abt: string;
  // APIレスポンスの追加フィールド
  inters?: number[];
  bdyTpe?: number[];
  marriageHistory?: number;
  personalities?: number[];
  stepToCall?: number;
  talkTheme?: number;
  lastLoginTime?: string;
  oftenVisitTime?: string;
  job?: string;
  looks?: string;
  holidays?: string;
  hometown?: string;
  bloodType?: string;
  housemate?: string;
  alcohol?: string;
  smokingStatus?: string;
  constellation?: string;
  bustSize?: string;
  isListedOnFleaMarket?: boolean;
  buzzLiveRecordingId?: string; // 過去配信の録画ID
};

// ライブチャンネル一覧
export type LiveChannels = {
  inLiveList: LiveChannelInfo[];
  standbyList: LiveChannelInfo[];
};

export type LiveChannel = {
  channelInfo: {
    rtcChannelToken: string;
    appId: string;
    channelId: string;
    userCount: number;
    thumbnailImageId: string;
  };
  broadcaster: {
    userName: string;
    region: number;
    age: number;
    abt: string;
    avaId: string;
    userId: string;
    isNewUser: boolean;
    bdyTpe: readonly number[];
    inters: number[];
    talkTheme: number;
    stepToCall: number;
    marriageHistory: number;
    showingFaceStatus: number;
    personalities: readonly number[];
    isLiveNow: boolean;
    lastLoginTime: string;
    oftenVisitTime?: string;
    job?: string;
    looks?: string;
    holidays?: string;
    hometown?: string;
    blood_type?: string;
    housemate?: string;
    smokingStatus?: string;
    alcohol?: string;
    constellation?: string;
    hasLovense: boolean;
    hLevel?: string;
    bustSize?: string;
  };
};

export type ActiveLiveChannels = {
  standbyList: LiveChannel[];
  inLiveList: LiveChannel[];
};
