import { memo } from 'react';
import { useBlock } from '@/hooks/useBlock';
import { useReport } from '@/hooks/useReport';

type Props = {
  onClose: () => void;
  partnerId: string;
  partnerName: string;
};

const BlockModal: React.FC<Props> = memo(
  ({ onClose, partnerId, partnerName }) => {
    const { addBlock, isLoading: isBlockLoading } = useBlock();
    const { addReport, isLoading: isReportLoading } = useReport();

    const handleClickOutside = (e: React.MouseEvent<HTMLDivElement>) => {
      if (e.target === e.currentTarget) {
        onClose();
      }
    };

    const handleBlock = async () => {
      if (isBlockLoading) return;

      const success = await addBlock(partnerId);
      if (success) {
        alert('このユーザーをブロックしました');
        onClose();
      }
    };

    const handleReport = async () => {
      if (isReportLoading) return;

      const success = await addReport(partnerId);
      if (success) {
        alert('このユーザーを通報しました');
        onClose();
      }
    };

    return (
      <div
        className="fixed inset-0 z-[9999] bg-black/50"
        onClick={handleClickOutside}
      >
        <div className="fixed right-0 bottom-0 left-0 flex items-center justify-center">
          <div className="relative w-full max-w-[600px] animate-slide-up rounded-t-[17px] bg-white/95 p-5">
            {/* タイトル */}
            <div className="border-[#e2e2e2] border-b py-[5px] text-center font-bold text-[#3a3a3aab] text-[13px]">
              アクションを選択してください
            </div>

            {/* ブロックボタン */}
            <div
              className="cursor-pointer border-[#e2e2e2] border-b py-2.5 text-center text-[#444444] text-base tracking-wide transition-all duration-300 hover:bg-[#49494914]"
              onClick={handleBlock}
            >
              {isBlockLoading ? '処理中...' : `${partnerName}さんをブロック`}
            </div>

            {/* 通報ボタン */}
            <div
              className="cursor-pointer border-[#e2e2e2] border-b py-2.5 text-center text-[#444444] text-base tracking-wide transition-all duration-300 hover:bg-[#49494914]"
              onClick={handleReport}
            >
              {isReportLoading ? '処理中...' : `${partnerName}さんを通報`}
            </div>

            {/* キャンセルボタン */}
            <div className="text-center">
              <button
                onClick={onClose}
                className="mt-2.5 cursor-pointer rounded-[20px] border border-[#5e5e5e62] bg-white px-[15px] py-[5px] text-[#3f3646] text-sm shadow-[0_1px_2px_rgba(0,0,0,0.342)] transition-all duration-300 hover:-translate-y-[0.1875em] hover:opacity-60 hover:shadow-[0_3px_6px_0_rgba(0,0,0,0.25)]"
              >
                キャンセル
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  },
);

BlockModal.displayName = 'BlockModal';

export default BlockModal;
