import { useEffect } from 'react';
import { NewsBannerList } from '@/app/[locale]/(header-footer-layout)/news/components/NewsBannerList';
import styles from '@/styles/PCNewsModal.module.css';

type PCNewsModalProps = {
  isOpen: boolean;
  onClose: () => void;
  isAllMissionCompleted: boolean;
  isUtage?: boolean;
  token?: string;
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

export const PCNewsModal: React.FC<PCNewsModalProps> = ({
  isOpen,
  onClose,
  isAllMissionCompleted,
  isUtage,
  token,
}) => {
  useEffect(() => {
    // モーダルが開かれたときだけ日付を保存
    if (isOpen) {
      const today = getCurrentDateInJapan();
      localStorage.setItem('lastOpenNewsModalDate', today);
    }
  }, [isOpen]);

  const handleClickOutside = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className={styles.modalBackdrop} onClick={handleClickOutside}>
      <div className={styles.modalContent}>
        <div className={styles.modalContentInner}>
          {/* NEWS Header */}
          <div className="sticky top-0 z-10 border-gray-300 border-b bg-white py-3 text-center font-bold text-lg text-slate-800">
            NEWS
          </div>
          <NewsBannerList
            isFirstBonusCourseExist={false}
            isSecondBonusCourseExist={false}
            isThirdBonusCourseExist={false}
            isFourthBonusCourseExist={false}
            isFifthBonusCourseExist={false}
            isAllMissionCompleted={true}
            isPaidySplitBannerExist={false}
            isUtage={isUtage || false}
            token={token || ''}
          />
        </div>
      </div>
      <button
        className="fixed top-4 right-4 z-20 rounded-full border-none bg-gradient-to-l from-[#fc999f] to-[#44c2eb] px-7 py-2.5 font-bold text-sm text-white tracking-wider transition-opacity duration-200 hover:opacity-80"
        onClick={onClose}
      >
        閉じる
      </button>
    </div>
  );
};

PCNewsModal.displayName = 'PCNewsModal';

export default PCNewsModal;
