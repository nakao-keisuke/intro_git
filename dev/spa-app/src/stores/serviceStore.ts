import { create } from 'zustand';
import { ClientHttpClient } from '@/libs/http/ClientHttpClient';
import {
  type BlockService,
  createBlockService,
} from '@/services/block/blockService';
// Service imports
import {
  type BoardService,
  createBoardService,
} from '@/services/board/boardService';
import {
  type BookmarkListService,
  createBookmarkListService,
} from '@/services/bookmark-list/bookmarkListService';
import {
  type CallService,
  createCallService,
} from '@/services/call/CallService';
import {
  type CallHistoryService,
  createCallHistoryService,
} from '@/services/callhistory/callHistoryService';
import {
  type ChangeMailService,
  createChangeMailService,
} from '@/services/change-mail/changeMailService';
import {
  type ChangePasswordService,
  createChangePasswordService,
} from '@/services/change-password/changePasswordService';
import {
  type ConfirmMailService,
  createConfirmMailService,
} from '@/services/confirm-mail/confirmMailService';
import {
  createFleaMarketService,
  type FleaMarketService,
} from '@/services/fleamarket/fleaMarketService';
import {
  createFootprintService,
  type FootprintService,
} from '@/services/footprint/footprintService';
import {
  createForgotPasswordService,
  type ForgotPasswordService,
} from '@/services/forgotPassword/forgotPasswordService';
import {
  createGalleryService,
  type GalleryService,
} from '@/services/gallery/galleryService';
import {
  createHomeService,
  type HomeService,
} from '@/services/home/homeService';
import {
  createLiveListService,
  type LiveListService,
} from '@/services/livelist/livelistService';
import {
  createLiveChannelService,
  type LiveChannelService,
} from '@/services/message/liveChannelService';
import {
  createMessageService,
  type MessageService,
} from '@/services/message/messageService';
import {
  createUserInfoService,
  type UserInfoService,
} from '@/services/message/userInfoService';
import {
  createMyPageService,
  type MyPageService,
} from '@/services/my-page/myPageService';
import {
  createNewsService,
  type NewsService,
} from '@/services/news/newsService';
import { createNotificationService } from '@/services/notification/notificationService';
import type { NotificationService } from '@/services/notification/type';
import {
  createOnboardingService,
  type OnboardingService,
} from '@/services/onboarding/onboardingService';
import {
  createPhoneVerificationService,
  type PhoneVerificationService,
} from '@/services/phone-verification/phoneVerificationService';
import {
  createProfileService,
  type ProfileService,
} from '@/services/profile/profileService';
import {
  createPurchaseService,
  type PurchaseService,
} from '@/services/purchase/purchaseService';
import {
  createRegisterMailService,
  type RegisterMailService,
} from '@/services/register-mail/registerMailService';
import {
  createSearchService,
  type SearchService,
} from '@/services/search/searchService';
import {
  createSettingService,
  type SettingService,
} from '@/services/setting/settingService';
import {
  createVideoChannelService,
  type VideoChannelService,
} from '@/services/videoChannel/videoChannelService';

/**
 * Service Store の型定義
 *
 * 全サービスインスタンスを保持するZustand Store
 * HttpClientはシングルトンで共有される
 */
type ServiceStoreState = {
  // Services
  boardService: BoardService;
  bookmarkListService: BookmarkListService;
  footprintService: FootprintService;
  homeService: HomeService;
  myPageService: MyPageService;
  searchService: SearchService;
  settingService: SettingService;
  changeMailService: ChangeMailService;
  changePasswordService: ChangePasswordService;
  blockService: BlockService;
  newsService: NewsService;
  notificationService: NotificationService;
  galleryService: GalleryService;
  profileService: ProfileService;
  videoChannelService: VideoChannelService;
  callHistoryService: CallHistoryService;
  messageService: MessageService;
  liveChannelService: LiveChannelService;
  userInfoService: UserInfoService;
  liveListService: LiveListService;
  fleaMarketService: FleaMarketService;
  purchaseService: PurchaseService;
  onboardingService: OnboardingService;
  forgotPasswordService: ForgotPasswordService;
  callService: CallService;
  phoneVerificationService: PhoneVerificationService;
  registerMailService: RegisterMailService;
  confirmMailService: ConfirmMailService;
};

/**
 * シングルトン HttpClient
 * 全サービスで共有される
 */
const httpClient = new ClientHttpClient();

/**
 * Service Store
 *
 * Recoil Service Injection パターンからの移行
 * - 全サービスインスタンスを保持
 * - HttpClientはシングルトンで共有
 * - 遅延初期化なし（アプリ起動時に全サービス初期化）
 */
export const useServiceStore = create<ServiceStoreState>()(() => ({
  boardService: createBoardService(httpClient),
  bookmarkListService: createBookmarkListService(httpClient),
  footprintService: createFootprintService(httpClient),
  homeService: createHomeService(httpClient),
  myPageService: createMyPageService(httpClient),
  searchService: createSearchService(httpClient),
  settingService: createSettingService(httpClient),
  changeMailService: createChangeMailService(httpClient),
  changePasswordService: createChangePasswordService(httpClient),
  blockService: createBlockService(httpClient),
  newsService: createNewsService(httpClient),
  notificationService: createNotificationService(httpClient),
  galleryService: createGalleryService(httpClient),
  profileService: createProfileService(httpClient),
  videoChannelService: createVideoChannelService(httpClient),
  callHistoryService: createCallHistoryService(httpClient),
  messageService: createMessageService(httpClient),
  liveChannelService: createLiveChannelService(httpClient),
  userInfoService: createUserInfoService(httpClient),
  liveListService: createLiveListService(httpClient),
  fleaMarketService: createFleaMarketService(httpClient),
  purchaseService: createPurchaseService(httpClient),
  onboardingService: createOnboardingService(httpClient),
  forgotPasswordService: createForgotPasswordService(httpClient),
  callService: createCallService(httpClient),
  phoneVerificationService: createPhoneVerificationService(httpClient),
  registerMailService: createRegisterMailService(httpClient),
  confirmMailService: createConfirmMailService(httpClient),
}));
