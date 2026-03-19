import { DeviceType, detectDeviceType } from '@/utils/deviceDetect';

// デバイス判定に基づくパス取得
const _getHomeAppPath = () => {
  const deviceType = detectDeviceType();
  return deviceType === DeviceType.ANDROID
    ? '/setting/android'
    : '/setting/iphone';
};

type BannerBase<T extends string, U extends string> = {
  readonly id: T;
  readonly path: U;
};

type TutoBanner = BannerBase<'tuto', '/tuto'>;
type HomeAppBanner = BannerBase<
  'homeApp',
  '/setting/android' | '/setting/iphone'
>;
type HomeAppFooterBanner = BannerBase<
  'homeAppFooter',
  '/setting/android' | '/setting/iphone'
>;
type PhoneBanner = BannerBase<'phone', '/phone'>;
type DailyBonusBanner = BannerBase<'dailybonus', '/premium-dailybonus'>;
type PCDailyBonusBanner = BannerBase<'dailybonus', '/premium-dailybonus/pc'>;
type DailyBonusFooterBanner = BannerBase<
  'dailybonusfooter',
  '/premium-dailybonus'
>;
type BonusCourseBanner = BannerBase<'bonuscourse', '/purchase'>;
type PointBackBanner = BannerBase<'pointback', '/pointback'>;
type CallRequestBanner = BannerBase<'callrequest', '/callrequest'>;
type ApproachBanner = BannerBase<'approach', '/approach'>;
type ApproachFooterBanner = BannerBase<'approachfooter', '/approach'>;
type PCApproachBanner = BannerBase<'approach', '/approach/pc'>;
type VoiceReleaseBanner = BannerBase<'voicerelease', '/voicerelease'>;
type BeginnerBanner = BannerBase<'beginner', '/beginner-campaign'>;
type PCBeginnerBanner = BannerBase<'beginner', '/beginner-campaign/pc'>;
type PurchaseZerothHeaderBanner = BannerBase<
  'purchasezerothheader',
  '/purchase'
>;
type PurchaseFirstHeaderBanner = BannerBase<'purchasefirstheader', '/purchase'>;
type PurchaseSecondHeaderBanner = BannerBase<
  'purchasesecondheader',
  '/purchase'
>;
type PurchaseThirdHeaderBanner = BannerBase<'purchasethirdheader', '/purchase'>;
type PurchaseFourthHeaderBanner = BannerBase<
  'purchasefourthheader',
  '/purchase'
>;

type PurchaseZerothBanner = BannerBase<'purchasezeroth', '/purchase'>;
type PurchaseFirstBanner = BannerBase<'purchasefirst', '/purchase'>;
type PurchaseSecondBanner = BannerBase<'purchasesecond', '/purchase'>;
type PurchaseThirdBanner = BannerBase<'purchasethird', '/purchase'>;
type PurchaseFourthBanner = BannerBase<'purchasefourth', '/purchase'>;
type LovenseBanner = BannerBase<'lovense', '/lovense'>;
type LovenseFooterBanner = BannerBase<'lovensevideofooter', '/lovense'>;
type LovenseVideoBanner = BannerBase<'lovensevideo', '/lovense'>;
type LovenseVideoFooterBanner = BannerBase<'lovensefooter', '/lovense'>;
type GalleryFooterBanner = BannerBase<'galleryfooter', '/gallery'>;
type GalleryHeaderBanner = BannerBase<'galleryheader', '/gallery'>;

type VideoChatMayuHeaderBanner = BannerBase<
  'videochatmayuheader',
  '/special-live-user-ad'
>;

type CreditMaintenanceBanner = BannerBase<
  'creditmaintenance',
  '/credit-maintenance'
>;

type LovenseRouletteBanner = BannerBase<'lovenseroulette', '/lovense_roulette'>;
type LovenseRouletteFooterBanner = BannerBase<
  'lovenseroulettefooter',
  '/lovense_roulette'
>;

// Flea market footer banner (LP or main page)
type FleaMarketFooterBanner = BannerBase<
  'fleamarketfooter',
  '/lp/flea-market' | '/fleamarket' | '/lp/transition'
>;

type MissionCompletedBanner = BannerBase<'missioncompleted', '/onboarding'>;
type PaidyHeaderBanner = BannerBase<'paidyheader', '/purchase'>;
type PaidyFooterBanner = BannerBase<'paidyfooter', '/purchase'>;
type VideoMissionBanner = BannerBase<'videomission', string>;
type VideoMissionFooterBanner = BannerBase<'videomissionfooter', string>;

type PointbackHeaderBanner = BannerBase<'pointbackheader', '/point-back'>;
type PointbackFooterBanner = BannerBase<'pointbackfooter', '/point-back'>;
type OnboardingNewFooterBanner = BannerBase<
  'onboardingnewfooter',
  '/onboarding'
>;
type OnboardingCreditBanner = BannerBase<'onboarding_credit', '/onboarding'>;
type ReviewCampaignBanner = BannerBase<'reviewcampaign', '/lp/review'>;

export type Banner =
  | TutoBanner
  | HomeAppBanner
  | HomeAppFooterBanner
  | PhoneBanner
  | DailyBonusBanner
  | PCDailyBonusBanner
  | DailyBonusFooterBanner
  | BonusCourseBanner
  | PointBackBanner
  | CallRequestBanner
  | ApproachBanner
  | ApproachFooterBanner
  | PCApproachBanner
  | VoiceReleaseBanner
  | BeginnerBanner
  | PCBeginnerBanner
  | PurchaseZerothHeaderBanner
  | PurchaseFirstHeaderBanner
  | PurchaseSecondHeaderBanner
  | PurchaseThirdHeaderBanner
  | PurchaseFourthHeaderBanner
  | PurchaseZerothBanner
  | PurchaseFirstBanner
  | PurchaseSecondBanner
  | PurchaseThirdBanner
  | PurchaseFourthBanner
  | LovenseBanner
  | LovenseFooterBanner
  | LovenseVideoBanner
  | LovenseVideoFooterBanner
  | GalleryFooterBanner
  | GalleryHeaderBanner
  | VideoChatMayuHeaderBanner
  | CreditMaintenanceBanner
  | LovenseRouletteBanner
  | LovenseRouletteFooterBanner
  | MissionCompletedBanner
  | PaidyHeaderBanner
  | PaidyFooterBanner
  | VideoMissionBanner
  | VideoMissionFooterBanner
  | PointbackHeaderBanner
  | PointbackFooterBanner
  | FleaMarketFooterBanner
  | OnboardingNewFooterBanner
  | OnboardingCreditBanner
  | ReviewCampaignBanner;
