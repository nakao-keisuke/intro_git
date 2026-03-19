// Image component removed (use <img> directly);
import RoundedThumbnail from '@/components/RoundedThumbnail';
import type { PartnerInfo } from '@/types/PartnerInfo';

const lovensePic = '/lovense_pink.webp';
const beginnerPic = '/beginner.icon.webp';

type Props = {
  partnerInfo: PartnerInfo;
};

/**
 * 発信画面用のパートナープロフィールコンポーネント
 * IncomingVideoCallのPartnerHeaderInfoと同じデザイン
 */
export default function OutgoingCallPartnerProfile({ partnerInfo }: Props) {
  return (
    <div className="mt-[60px] flex flex-col items-center">
      {/* プロフィール画像 */}
      <div className="mb-[6px] flex h-[120px] w-[120px] items-center justify-center overflow-hidden rounded-full bg-white shadow-[0_2px_12px_rgba(0,0,0,0.1)] max-[320px]:h-[180px] max-[320px]:w-[180px]">
        <RoundedThumbnail
          avatarId={partnerInfo.avatarId}
          deviceCategory="mobile"
          customSize={{ width: 120, height: 120 }}
        />
      </div>

      {/* プロフィール情報カード */}
      <div className="mt-3 w-[min(90vw,360px)] rounded-2xl bg-white/25 px-4 py-3 shadow-[0_2px_12px_rgba(0,0,0,0.12)]">
        {/* 1行目: 名前 / 年齢 / 地域 を横並び */}
        <div className="flex flex-wrap items-center justify-center gap-2 text-[#fff]">
          <span className="font-bold text-[1.1rem] tracking-[0.04em] max-[320px]:text-[1rem] max-[768px]:text-[1.1rem]">
            {partnerInfo.userName}
          </span>
          {partnerInfo.age && (
            <span className="font-semibold text-[1rem] leading-6 opacity-90 max-[768px]:text-[0.95rem]">
              ({partnerInfo.age})
            </span>
          )}
          {partnerInfo.region && partnerInfo.region !== '未設定' && (
            <span className="font-semibold text-[0.95rem] leading-6 opacity-90 max-[768px]:text-[0.9rem]">
              📍 {partnerInfo.region}
            </span>
          )}
        </div>

        {/* 2行目: バッジ */}
        <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
          {partnerInfo.hasLovense && (
            <span className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-[#ff4fa0] to-[#ff92d5] px-2 py-1 text-white shadow-[0_1px_5px_0_rgba(0,0,0,0.4)]">
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-white/95">
                <Image src={lovensePic} alt="Lovense" width={18} height={18} />
              </div>
              <span className="font-bold text-[11px] tracking-[0.08em]">
                遠隔バイブ対応
              </span>
            </span>
          )}
          {partnerInfo.isNewUser && (
            <span className="flex items-center gap-1 px-2 py-1">
              <Image src={beginnerPic} alt="初心者" width={18} height={18} />
            </span>
          )}
          {partnerInfo.bustSize && partnerInfo.bustSize !== '未設定' && (
            <span className="rounded-full bg-rose-50 px-2.5 py-1 font-semibold text-[0.8rem] text-rose-500 shadow-[0_1px_5px_0_rgba(0,0,0,0.4)]">
              👙 {partnerInfo.bustSize}
            </span>
          )}
        </div>

        {/* 3行目: 自己紹介 */}
        {partnerInfo.about && (
          <div className="mt-3 overflow-hidden whitespace-pre-wrap break-words text-center text-[#fff] text-[0.95rem] [-webkit-box-orient:vertical] [-webkit-line-clamp:2] [display:-webkit-box] max-[768px]:text-[0.9rem]">
            {partnerInfo.about}
          </div>
        )}
      </div>
    </div>
  );
}
