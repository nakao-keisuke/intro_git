// TODO: i18n - import { useTranslations } from '#/i18n';
import type React from 'react';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

type PurchaseConfirmModalProps = {
  mediaType: 'image' | 'video' | 'audio';
  price: number; // ポイント数
  previewSrc?: string; // サムネイルURL（audioの場合は不要）
  onConfirm: () => void;
  onCancel: () => void;
};

const PurchaseConfirmModal: React.FC<PurchaseConfirmModalProps> = ({
  mediaType,
  price,
  previewSrc,
  onConfirm,
  onCancel,
}) => {
  const t = useTranslations('mediaPurchase');
  const [portalContainer, setPortalContainer] = useState<HTMLElement | null>(
    null,
  );

  useEffect(() => {
    setPortalContainer(document.body);
  }, []);

  if (!portalContainer) {
    return null;
  }

  const label = t(mediaType);
  return createPortal(
    <div
      className="fixed inset-0 z-[2000] flex items-center justify-center bg-[rgba(38,38,38,0.295)] backdrop-blur-[3px]"
      onClick={onCancel}
    >
      <div
        className="w-[min(420px,92vw)] animate-[popup_0.2s_cubic-bezier(0.22,1,0.36,1)_forwards] rounded-[14px] border border-[#ececec] bg-white p-4 shadow-[0_10px_30px_rgba(0,0,0,0.12)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-[10px] flex items-center justify-between">
          <div className="font-bold text-base text-gray-800">
            {t('purchaseTitle', { label })}
          </div>
          <div className="rounded-full bg-[#C8F0A3] px-[10px] py-1 font-bold text-slate-900 text-xs">
            {price}pt
          </div>
        </div>
        {mediaType === 'audio' ? (
          <div className="mx-auto mb-3 flex w-[min(320px,80vw)] items-center justify-center rounded-xl bg-[#f7f7f7] p-8">
            <div className="text-center">
              <div className="mb-2 text-6xl">🎵</div>
              <div className="text-gray-600 text-sm">{t('audioMessage')}</div>
            </div>
          </div>
        ) : (
          <div className="mx-auto mb-3 flex aspect-[4/3] w-[min(320px,80vw)] items-center justify-center overflow-hidden rounded-xl bg-[#f7f7f7]">
            <img
              className="h-full w-full object-cover blur-[9px] saturate-105"
              src={previewSrc!}
              alt={t('previewAlt', { label })}
            />
          </div>
        )}
        {mediaType === 'audio' ? (
          <div className="mt-2 text-center text-gray-500 text-xs">
            {t('audioNote')}
          </div>
        ) : (
          <div className="mt-2 text-center text-gray-500 text-xs">
            {t('mediaNote')}
          </div>
        )}
        <div className="mx-auto mt-[14px] flex w-full max-w-[320px] justify-center gap-3">
          <button
            className="min-w-[120px] flex-1 cursor-pointer rounded-[10px] border border-gray-200 bg-gray-100 px-[14px] py-[10px] text-center font-semibold text-gray-700 text-sm hover:bg-gray-50"
            onClick={onCancel}
          >
            {t('cancel')}
          </button>
          <button
            className="min-w-[120px] flex-1 cursor-pointer rounded-[10px] bg-[#8dd36a] px-[14px] py-[10px] text-center font-semibold text-sm text-white shadow-[0_6px_14px_rgba(141,211,106,0.35)] hover:bg-[#7ec45a]"
            onClick={onConfirm}
          >
            {t('purchase')}
          </button>
        </div>
      </div>
    </div>,
    portalContainer,
  );
};

export default PurchaseConfirmModal;
