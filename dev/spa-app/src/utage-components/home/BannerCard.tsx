import type React from 'react';
import type { Banner } from '@/types/Banner';

const homeAppBannerPic = '/banner/home_app_.webp';
const homeAppBannerFooterPic = '/banner/home_app_footer.webp';
const phoneBannerPic = '/banner/utageweb_app_header.webp';
const TutobannerPic = '/banner/tuto.webp';
const dailybonusPic = '/banner/daily_bonus.webp';
const dailybonusFooterPic = '/banner/daily_bonus_footer.webp';
const bonusCoursePic = '/banner/first_purchase_header.webp';
const pointbackPic = '/banner/pointback.webp';
const callrequestPic = '/banner/callrequest.webp';
const approachPic = '/banner/approach.webp';
const approachFooterPic = '/banner/approach_footer.webp';
const PurchaseZerothHeaderPic = '/banner/1stpurchase_massege_header.webp';
const PurchaseFirstHeaderPic = '/banner/2ndpurchase_massege_header.webp';
const PurchaseSecondHeaderPic = '/banner/3rdpurchase_massege_header.webp';
const PurchaseThirdHeaderPic = '/banner/4thpurchase_massege_header.webp';
const PurchaseFourthHeaderPic = '/banner/5thpurchase_massege_header.webp';
const PurchaseZerothPic = '/banner/1stpurchase_massege_footer.webp';
const PurchaseFirstPic = '/banner/2ndpurchase_massege_footer.webp';
const PurchaseSecondPic = '/banner/3rdpurchase_massege_footer.webp';
const PurchaseThirdPic = '/banner/4thpurchase_massege_footer.webp';
const PurchaseFourthPic = '/banner/5thpurchase_massege_footer.webp';

// Image component removed (use <img> directly);
import { Link } from '@tanstack/react-router';
import { useNavigate } from '@tanstack/react-router';
import CreditMaintenancePic from 'public/banner/credit_maintenance.webp';
import GalleryFooterPic from 'public/banner/gallery_footer.webp';
import GalleryHeaderPic from 'public/banner/gallery_header.webp';
import LovensePic from 'public/banner/lovense.webp';
import LovenseFooterPic from 'public/banner/lovense_footer.webp';
import LovenseRouletteFooterPic from 'public/banner/lovense_ticket_footer.webp';
import LovenseRoulettePic from 'public/banner/lovense_ticket_header.webp';
import LovenseVideoFooterPic from 'public/banner/lovense_video_footer.webp';
import LovenseVideoPic from 'public/banner/lovense_video_header.webp';
import VideoMissionFooterPic from 'public/banner/making_call_mission_footer.webp';
import VideoMissionPic from 'public/banner/making_call_mission_header.webp';
import OnboardingCreditPic from 'public/banner/onboarding_credit.webp';
import MissionCompletedPic from 'public/banner/onboarding_new_header.webp';
import PaidyHeaderPic from 'public/banner/paidy_split_banner.webp';
import PaidyFooterPic from 'public/banner/paidy_split_footer.webp';
import PointbackFooterPic from 'public/banner/point-back.f.webp';
import PointbackHeaderPic from 'public/banner/point-back.h.webp';
import videoChatMayuPic from 'public/banner/sp_vchat_mayu_h.webp';
import { usePurchaseAttribution } from '@/hooks/usePurchaseAttribution';
import type { DeviceCategory } from '@/types/DeviceCategory';
import { PURCHASE_FLOW } from '@/types/purchaseAttribution';
import { trackEvent } from '@/utils/eventTracker';

// 購入バナーの特設ページマッピング
const PURCHASE_SPECIAL_PAGE_MAP = {
  purchasezerothheader: '/purchase/1st-purchase-message',
  purchasefirstheader: '/purchase/2nd-purchase-message',
  purchasesecondheader: '/purchase/3rd-purchase-message',
  purchasethirdheader: '/purchase/4th-purchase-message',
  purchasefourthheader: '/purchase/5th-purchase-message',
} as const;

type BannerCardProps = {
  banner: Banner;
  index: number;
  deviceCategory: DeviceCategory;
  isFromPurchasePage?: boolean;
};

const BannerCard: React.FC<BannerCardProps> = ({
  banner,
  index,
  deviceCategory,
  isFromPurchasePage = false,
}) => {
  const router = useRouter();
  const { trackPurchaseIntent } = usePurchaseAttribution();

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // オンボーディングクレカ登録バナーのタップ計測
    if (banner.id === 'onboarding_credit') {
      trackEvent('TAP_ONBOARDING_CREDIT_BANNER', {
        source: isFromPurchasePage ? 'purchase' : 'home',
      });
    }

    if (banner.id.startsWith('purchase')) {
      e.preventDefault();
      if (isFromPurchasePage) {
        // 購入ページからの場合：特設ページに遷移
        const specialPath =
          PURCHASE_SPECIAL_PAGE_MAP[
            banner.id as keyof typeof PURCHASE_SPECIAL_PAGE_MAP
          ];
        if (specialPath) {
          router.push(specialPath);
          return;
        }
        // 特設ページが見つからない場合は通常の購入ページに遷移（フォールバック）
        console.warn(
          `Special page not found for banner id: ${banner.id}, falling back to purchase page`,
        );
        return;
      }
      // ホームからの場合：現在の挙動を維持
      trackPurchaseIntent('banner.home_purchase', PURCHASE_FLOW.PURCHASE_PAGE);
      router.push('/purchase?source=home_banner');
    }
  };

  return (
    <div style={{ pointerEvents: 'auto' }}>
      <Link
        href={banner.id.startsWith('purchase') ? '#' : banner.path}
        onClick={handleClick}
        target={deviceCategory === 'desktop' ? '_blank' : '_self'}
        rel="noopener noreferrer"
      >
        <div>
          {banner.id === 'tuto' && (
            <Image
              src={TutobannerPic}
              alt="遊び方"
              width={3175}
              height={907}
              quality="100"
              priority={index === 0}
              sizes={deviceCategory === 'mobile' ? '67vw' : '25vw'}
              style={{
                objectFit: 'contain',
                width: '100%',
                height: 'auto',
              }}
            />
          )}
          {banner.id === 'dailybonus' && (
            <Image
              src={dailybonusPic}
              alt="ダブルデイリーボーナス"
              width={840}
              height={240}
              priority={index === 0}
              quality="100"
              sizes={deviceCategory === 'mobile' ? '67vw' : '25vw'}
              style={{
                objectFit: 'contain',
                width: '100%',
                height: 'auto',
              }}
            />
          )}
          {banner.id === 'dailybonusfooter' && (
            <Image
              src={dailybonusFooterPic}
              alt="ダブルデイリーボーナス"
              width={1280}
              height={670}
              priority={index === 0}
              quality="100"
              sizes={deviceCategory === 'mobile' ? '67vw' : '25vw'}
              style={{
                objectFit: 'contain',
                width: '100%',
                height: 'auto',
              }}
            />
          )}
          {banner.id === 'homeApp' && (
            <Image
              src={homeAppBannerPic}
              alt="ホームアプリ"
              width={840}
              height={240}
              sizes={deviceCategory === 'mobile' ? '67vw' : '25vw'}
              priority={index === 0}
              style={{
                objectFit: 'contain',
                width: '100%',
                height: 'auto',
              }}
            />
          )}
          {banner.id === 'homeAppFooter' && (
            <Image
              src={homeAppBannerFooterPic}
              alt="ホームアプリ"
              width={600}
              height={300}
              sizes={deviceCategory === 'mobile' ? '67vw' : '25vw'}
              priority={index === 0}
              style={{
                objectFit: 'contain',
                width: '100%',
                height: 'auto',
              }}
            />
          )}
          {banner.id === 'phone' && (
            <Image
              src={phoneBannerPic}
              alt="アプリ版のダウンロードはこちら！"
              width={840}
              height={240}
              sizes={deviceCategory === 'mobile' ? '67vw' : '25vw'}
              priority={index === 0}
              style={{
                objectFit: 'contain',
                width: '100%',
                height: 'auto',
              }}
            />
          )}
          {banner.id === 'bonuscourse' && (
            <Image
              src={bonusCoursePic}
              alt="980円コースポイント倍増"
              width={840}
              height={240}
              sizes={deviceCategory === 'mobile' ? '67vw' : '25vw'}
              priority={index === 0}
              style={{
                objectFit: 'contain',
                width: '100%',
                height: 'auto',
              }}
            />
          )}
          {banner.id === 'pointback' && (
            <Image
              src={pointbackPic}
              alt="ポイントバックキャンペーン"
              width={840}
              height={240}
              sizes={deviceCategory === 'mobile' ? '67vw' : '25vw'}
              priority={index === 0}
              style={{
                objectFit: 'contain',
                width: '100%',
                height: 'auto',
              }}
            />
          )}
          {banner.id === 'callrequest' && (
            <Image
              src={callrequestPic}
              alt="通話リクエスト"
              width={840}
              height={240}
              sizes={deviceCategory === 'mobile' ? '67vw' : '25vw'}
              priority={index === 0}
              style={{
                objectFit: 'contain',
                width: '100%',
                height: 'auto',
              }}
            />
          )}
          {banner.id === 'approach' && (
            <Image
              src={approachPic}
              alt="通話が上手くできない方"
              width={840}
              height={240}
              sizes={deviceCategory === 'mobile' ? '67vw' : '25vw'}
              priority={index === 0}
              style={{
                objectFit: 'contain',
                width: '100%',
                height: 'auto',
              }}
            />
          )}
          {banner.id === 'approachfooter' && (
            <Image
              src={approachFooterPic}
              alt="通話が上手くできない方"
              width={640}
              height={300}
              sizes={deviceCategory === 'mobile' ? '67vw' : '25vw'}
              priority={index === 0}
              style={{
                objectFit: 'contain',
                width: '100%',
                height: 'auto',
              }}
            />
          )}
          {banner.id === 'purchasezerothheader' && (
            <Image
              src={PurchaseZerothHeaderPic}
              alt="0回目購入イベント"
              width={840}
              height={240}
              sizes={deviceCategory === 'mobile' ? '67vw' : '25vw'}
              priority={index === 0}
              style={{
                objectFit: 'contain',
                width: '100%',
                height: 'auto',
              }}
            />
          )}
          {banner.id === 'purchasefirstheader' && (
            <Image
              src={PurchaseFirstHeaderPic}
              alt="1回目購入イベント"
              width={840}
              height={240}
              sizes={deviceCategory === 'mobile' ? '67vw' : '25vw'}
              priority={index === 0}
              style={{
                objectFit: 'contain',
                width: '100%',
                height: 'auto',
              }}
            />
          )}
          {banner.id === 'purchasesecondheader' && (
            <Image
              src={PurchaseSecondHeaderPic}
              alt="2回目購入イベント"
              width={840}
              height={240}
              sizes={deviceCategory === 'mobile' ? '67vw' : '25vw'}
              priority={index === 0}
              style={{
                objectFit: 'contain',
                width: '100%',
                height: 'auto',
              }}
            />
          )}
          {banner.id === 'purchasethirdheader' && (
            <Image
              src={PurchaseThirdHeaderPic}
              alt="3回目購入イベント"
              width={840}
              height={241}
              sizes={deviceCategory === 'mobile' ? '67vw' : '25vw'}
              priority={index === 0}
              style={{
                objectFit: 'contain',
                width: '100%',
                height: 'auto',
              }}
            />
          )}
          {banner.id === 'purchasefourthheader' && (
            <Image
              src={PurchaseFourthHeaderPic}
              alt="4回目購入イベント"
              width={840}
              height={240}
              sizes={deviceCategory === 'mobile' ? '67vw' : '25vw'}
              priority={index === 0}
              style={{
                objectFit: 'contain',
                width: '100%',
                height: 'auto',
              }}
            />
          )}
          {banner.id === 'purchasezeroth' && (
            <Image
              src={PurchaseZerothPic}
              alt="0回目購入イベント"
              width={640}
              height={300}
              sizes={deviceCategory === 'mobile' ? '67vw' : '25vw'}
              priority={index === 0}
              style={{
                objectFit: 'contain',
                width: '100%',
                height: 'auto',
              }}
            />
          )}
          {banner.id === 'purchasefirst' && (
            <Image
              src={PurchaseFirstPic}
              alt="1回目購入イベント"
              width={640}
              height={300}
              sizes={deviceCategory === 'mobile' ? '67vw' : '25vw'}
              priority={index === 0}
              style={{
                objectFit: 'contain',
                width: '100%',
                height: 'auto',
              }}
            />
          )}
          {banner.id === 'purchasesecond' && (
            <Image
              src={PurchaseSecondPic}
              alt="2回目購入イベント"
              width={640}
              height={300}
              sizes={deviceCategory === 'mobile' ? '67vw' : '25vw'}
              priority={index === 0}
              style={{
                objectFit: 'contain',
                width: '100%',
                height: 'auto',
              }}
            />
          )}
          {banner.id === 'purchasethird' && (
            <Image
              src={PurchaseThirdPic}
              alt="3回目購入イベント"
              width={640}
              height={300}
              sizes={deviceCategory === 'mobile' ? '67vw' : '25vw'}
              priority={index === 0}
              style={{
                objectFit: 'contain',
                width: '100%',
                height: 'auto',
              }}
            />
          )}
          {banner.id === 'purchasefourth' && (
            <Image
              src={PurchaseFourthPic}
              alt="4回目購入イベント"
              width={640}
              height={300}
              sizes={deviceCategory === 'mobile' ? '67vw' : '25vw'}
              priority={index === 0}
              style={{
                objectFit: 'contain',
                width: '100%',
                height: 'auto',
              }}
            />
          )}
          {banner.id === 'lovense' && (
            <Image
              src={LovensePic}
              alt="Lovenseとは？"
              sizes={deviceCategory === 'mobile' ? '67vw' : '25vw'}
              priority={index === 0}
              style={{
                objectFit: 'contain',
                width: '100%',
                height: 'auto',
              }}
            />
          )}
          {banner.id === 'lovensefooter' && (
            <Image
              src={LovenseFooterPic}
              alt="Lovenseとは？"
              sizes={deviceCategory === 'mobile' ? '67vw' : '25vw'}
              priority={index === 0}
              style={{
                objectFit: 'contain',
                width: '100%',
                height: 'auto',
              }}
            />
          )}
          {banner.id === 'lovensevideo' && (
            <Image
              src={LovenseVideoPic}
              alt="Lovenseとは？"
              sizes={deviceCategory === 'mobile' ? '67vw' : '25vw'}
              priority={index === 0}
              style={{
                objectFit: 'contain',
                width: '100%',
                height: 'auto',
              }}
            />
          )}
          {banner.id === 'lovensevideofooter' && (
            <Image
              src={LovenseVideoFooterPic}
              alt="Lovenseとは？"
              sizes={deviceCategory === 'mobile' ? '67vw' : '25vw'}
              priority={index === 0}
              style={{
                objectFit: 'contain',
                width: '100%',
                height: 'auto',
              }}
            />
          )}
          {banner.id === 'galleryfooter' && (
            <Image
              src={GalleryFooterPic}
              alt="ギャラリー機能リリース"
              sizes={deviceCategory === 'mobile' ? '67vw' : '25vw'}
              priority={index === 0}
              style={{
                objectFit: 'contain',
                width: '100%',
                height: 'auto',
              }}
            />
          )}
          {banner.id === 'galleryheader' && (
            <Image
              src={GalleryHeaderPic}
              alt="ギャラリー機能リリース"
              sizes={deviceCategory === 'mobile' ? '67vw' : '25vw'}
              priority={index === 0}
              style={{
                objectFit: 'contain',
                width: '100%',
                height: 'auto',
              }}
            />
          )}
          {banner.id === 'videochatmayuheader' && (
            <Image
              src={videoChatMayuPic}
              alt="ビデオチャット無料キャンペーン"
              sizes={deviceCategory === 'mobile' ? '67vw' : '25vw'}
              priority={index === 0}
              style={{
                objectFit: 'contain',
                width: '100%',
                height: 'auto',
              }}
            />
          )}
          {banner.id === 'creditmaintenance' && (
            <Image
              src={CreditMaintenancePic}
              alt="クレジットメンテナンス"
              sizes={deviceCategory === 'mobile' ? '67vw' : '25vw'}
              priority={index === 0}
              style={{
                objectFit: 'contain',
                width: '100%',
                height: 'auto',
              }}
            />
          )}
          {banner.id === 'lovenseroulette' && (
            <Image
              src={LovenseRoulettePic}
              alt="Lovenseルーレットヘッダー"
              sizes={deviceCategory === 'mobile' ? '67vw' : '25vw'}
              priority={index === 0}
              style={{
                objectFit: 'contain',
                width: '100%',
                height: 'auto',
              }}
            />
          )}
          {banner.id === 'lovenseroulettefooter' && (
            <Image
              src={LovenseRouletteFooterPic}
              alt="Lovenseルーレットフッター"
              sizes={deviceCategory === 'mobile' ? '67vw' : '25vw'}
              priority={index === 0}
              style={{
                objectFit: 'contain',
                width: '100%',
                height: 'auto',
              }}
            />
          )}
          {banner.id === 'missioncompleted' && (
            <Image
              src={MissionCompletedPic}
              alt="オンボーディングバナー"
              sizes={deviceCategory === 'mobile' ? '67vw' : '25vw'}
              priority={index === 0}
              style={{
                objectFit: 'contain',
                width: '100%',
                height: 'auto',
              }}
            />
          )}
          {banner.id === 'onboarding_credit' && (
            <Image
              src={OnboardingCreditPic}
              alt="クレカ登録ミッションバナー"
              sizes={deviceCategory === 'mobile' ? '67vw' : '25vw'}
              priority={index === 0}
              style={{
                objectFit: 'contain',
                width: '100%',
                height: 'auto',
              }}
            />
          )}
          {banner.id === 'paidyfooter' && (
            <Image
              src={PaidyFooterPic}
              alt="Paidyとは？"
              sizes={deviceCategory === 'mobile' ? '67vw' : '25vw'}
              priority={index === 0}
              style={{
                objectFit: 'contain',
                width: '100%',
                height: 'auto',
              }}
            />
          )}

          {banner.id === 'paidyheader' && (
            <Image
              src={PaidyHeaderPic}
              alt="Paidyとは？"
              sizes={deviceCategory === 'mobile' ? '67vw' : '25vw'}
              priority={index === 0}
              style={{
                objectFit: 'contain',
                width: '100%',
                height: 'auto',
              }}
            />
          )}
          {banner.id === 'videomission' && (
            <Image
              src={VideoMissionPic}
              alt="ビデオチャットミッション"
              sizes={deviceCategory === 'mobile' ? '67vw' : '25vw'}
              priority={index === 0}
              style={{
                objectFit: 'contain',
                width: '100%',
                height: 'auto',
              }}
            />
          )}
          {banner.id === 'videomissionfooter' && (
            <Image
              src={VideoMissionFooterPic}
              alt="ビデオチャットミッション"
              sizes={deviceCategory === 'mobile' ? '67vw' : '25vw'}
              priority={index === 0}
              style={{
                objectFit: 'contain',
                width: '100%',
                height: 'auto',
              }}
            />
          )}
          {banner.id === 'pointbackheader' && (
            <Image
              src={PointbackHeaderPic}
              alt="ポイントバック"
              sizes={deviceCategory === 'mobile' ? '67vw' : '25vw'}
              priority={index === 0}
              style={{
                objectFit: 'contain',
                width: '100%',
                height: 'auto',
              }}
            />
          )}
          {banner.id === 'pointbackfooter' && (
            <Image
              src={PointbackFooterPic}
              alt="ポイントバック"
              sizes={deviceCategory === 'mobile' ? '67vw' : '25vw'}
              priority={index === 0}
              style={{
                objectFit: 'contain',
                width: '100%',
                height: 'auto',
              }}
            />
          )}
        </div>
      </Link>
    </div>
  );
};

export default BannerCard;
