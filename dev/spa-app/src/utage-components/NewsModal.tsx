import { useEffect } from 'react';
import ReactModal from 'react-modal';
import { NewsBannerList } from '@/app/[locale]/(header-footer-layout)/news/components/NewsBannerList';

type NewsModalProps = {
  isOpen: boolean;
  onClose: () => void;
  isAllMissionCompleted: boolean;
  isUtage?: boolean;
  token: string;
  // 購入コースフラグを追加
  isFirstBonusCourseExist?: boolean;
  isSecondBonusCourseExist?: boolean;
  isThirdBonusCourseExist?: boolean;
  isFourthBonusCourseExist?: boolean;
  isFifthBonusCourseExist?: boolean;
  isPaidySplitBannerExist?: boolean;
};

// 日本時間での現在の日付を 'YYYY-MM-DD' 形式で取得する関数
const getCurrentDateInJapan = () => {
  const now = new Date();
  // 日本時間に調整（JST = UTC+9）
  const jstDate = new Date(now.getTime() + 9 * 60 * 60 * 1000);

  const year = jstDate.getUTCFullYear();
  const month = String(jstDate.getUTCMonth() + 1).padStart(2, '0');
  const day = String(jstDate.getUTCDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};

export const NewsModal: React.FC<NewsModalProps> = ({
  isOpen,
  onClose,
  isAllMissionCompleted,
  isUtage,
  token,
  isFirstBonusCourseExist = false,
  isSecondBonusCourseExist = false,
  isThirdBonusCourseExist = false,
  isFourthBonusCourseExist = false,
  isFifthBonusCourseExist = false,
  isPaidySplitBannerExist = false,
}) => {
  useEffect(() => {
    // モーダルが開かれたときだけ日付を保存
    // bfcache対応: try-catchでlocalStorageアクセスをラップ
    if (isOpen) {
      try {
        const today = getCurrentDateInJapan();
        localStorage.setItem('lastOpenNewsModalDate', today);
      } catch (error) {
        console.error('Failed to update localStorage in NewsModal:', error);
      }
    }
  }, [isOpen]);

  return (
    <ReactModal
      isOpen={isOpen}
      onRequestClose={onClose}
      shouldCloseOnEsc
      shouldCloseOnOverlayClick
      ariaHideApp={false}
      contentLabel="ニュース"
      overlayClassName="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-black/50"
      className="relative max-h-[90vh] w-[90%]"
    >
      <div className="max-h-[90vh] overflow-y-auto rounded-xl bg-white pb-24">
        {/* NEWS Header */}
        <div className="sticky top-0 z-10 rounded-t-xl border-gray-300 border-b bg-white py-3 text-center font-bold text-lg text-slate-800">
          NEWS
        </div>
        <NewsBannerList
          isFirstBonusCourseExist={isFirstBonusCourseExist}
          isSecondBonusCourseExist={isSecondBonusCourseExist}
          isThirdBonusCourseExist={isThirdBonusCourseExist}
          isFourthBonusCourseExist={isFourthBonusCourseExist}
          isFifthBonusCourseExist={isFifthBonusCourseExist}
          isAllMissionCompleted={isAllMissionCompleted}
          isPaidySplitBannerExist={isPaidySplitBannerExist}
          isUtage={isUtage || false}
          token={token}
        />
      </div>
      {/* 閉じるボタンを外側のコンテナに配置してスクロールに影響されないようにする */}
      <button
        className="absolute bottom-3 left-1/2 z-[100001] w-[95%] -translate-x-1/2 transform rounded-xl border-none bg-gradient-to-l from-[#fc999f] to-[#44c2eb] py-4 font-bold text-base text-white tracking-wider shadow-lg transition-opacity duration-200 hover:opacity-80"
        onClick={onClose}
      >
        閉じる
      </button>
    </ReactModal>
  );
};

NewsModal.displayName = 'NewsModal';

export default NewsModal;
