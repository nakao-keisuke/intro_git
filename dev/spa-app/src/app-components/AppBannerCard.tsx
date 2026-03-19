// Image component removed (use <img> directly);
import { Link } from '@tanstack/react-router';
// Images used in PayNoModal flows
import MissionCompletedPic from 'public/banner/onboarding_new_header.webp';
import { useNavigateWithOrigin } from '@/hooks/useNavigateWithOrigin';
import type { Banner } from '@/types/Banner';
import type { DeviceCategory } from '@/types/DeviceCategory';

const PurchaseZerothPic = '/banner/1stpurchase_massege_footer.webp';
const PurchaseFirstPic = '/banner/2ndpurchase_massege_footer.webp';
const PurchaseSecondPic = '/banner/3rdpurchase_massege_footer.webp';
const PurchaseThirdPic = '/banner/4thpurchase_massege_footer.webp';
const PurchaseFourthPic = '/banner/5thpurchase_massege_footer.webp';

type Props = {
  banner: Banner;
  index: number;
  deviceCategory: DeviceCategory;
};

// App Router 互換の軽量 BannerCard（PayNoModal で使う分のみ対応）
export default function AppBannerCard({
  banner,
  index,
  deviceCategory,
}: Props) {
  const nav = useNavigateWithOrigin();

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (banner.id.startsWith('purchase')) {
      e.preventDefault();
      nav.push(
        '/purchase?source=banner',
        nav.originFromModal(`pay-no:banner:${banner.id}`),
      );
    }
  };

  const sizes = deviceCategory === 'mobile' ? '67vw' : '25vw';

  return (
    <div style={{ pointerEvents: 'auto' }}>
      <Link
        href={banner.id.startsWith('purchase') ? '#' : banner.path}
        onClick={handleClick}
      >
        <div>
          {banner.id === 'missioncompleted' && (
            <Image
              src={MissionCompletedPic}
              alt="オンボーディングバナー"
              sizes={sizes}
              priority={index === 0}
              style={{ objectFit: 'contain', width: '100%', height: 'auto' }}
            />
          )}
          {banner.id === 'purchasezeroth' && (
            <Image
              src={PurchaseZerothPic}
              alt="初回購入キャンペーン"
              sizes={sizes}
              priority={index === 0}
              style={{ objectFit: 'contain', width: '100%', height: 'auto' }}
            />
          )}
          {banner.id === 'purchasefirst' && (
            <Image
              src={PurchaseFirstPic}
              alt="2回目購入キャンペーン"
              sizes={sizes}
              priority={index === 0}
              style={{ objectFit: 'contain', width: '100%', height: 'auto' }}
            />
          )}
          {banner.id === 'purchasesecond' && (
            <Image
              src={PurchaseSecondPic}
              alt="3回目購入キャンペーン"
              sizes={sizes}
              priority={index === 0}
              style={{ objectFit: 'contain', width: '100%', height: 'auto' }}
            />
          )}
          {banner.id === 'purchasethird' && (
            <Image
              src={PurchaseThirdPic}
              alt="4回目購入キャンペーン"
              sizes={sizes}
              priority={index === 0}
              style={{ objectFit: 'contain', width: '100%', height: 'auto' }}
            />
          )}
          {banner.id === 'purchasefourth' && (
            <Image
              src={PurchaseFourthPic}
              alt="5回目購入キャンペーン"
              sizes={sizes}
              priority={index === 0}
              style={{ objectFit: 'contain', width: '100%', height: 'auto' }}
            />
          )}
        </div>
      </Link>
    </div>
  );
}
