import { memo, useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import FleaMarketItemDetailCompact, {
  type ItemDataForPurchase,
} from './FleaMarketItemDetailCompact';
import FleaMarketPurchaseCompact, {
  type FleaMarketPurchaseCompleteData,
} from './FleaMarketPurchaseCompact';

type FleaMarketItemOverlayProps = {
  itemId: string;
  isOpen: boolean;
  onClose: () => void;
  onPurchaseComplete?: (data: FleaMarketPurchaseCompleteData) => void;
  initialViewMode?: ViewMode;
  initialItemDataForPurchase?: ItemDataForPurchase | null;
};

type ViewMode = 'detail' | 'purchase';

const FleaMarketItemOverlay = memo<FleaMarketItemOverlayProps>(
  ({
    itemId,
    isOpen,
    onClose,
    onPurchaseComplete,
    initialViewMode,
    initialItemDataForPurchase,
  }) => {
    const [viewMode, setViewMode] = useState<ViewMode>('detail');
    const [itemDataForPurchase, setItemDataForPurchase] =
      useState<ItemDataForPurchase | null>(null);

    // オーバーレイが開かれるたびに初期状態を設定
    // itemIdは依存配列から除外（同じオーバーレイ内での詳細→購入遷移を妨げないため）
    useEffect(() => {
      if (isOpen) {
        const shouldOpenPurchase =
          initialViewMode === 'purchase' && initialItemDataForPurchase;
        setViewMode(shouldOpenPurchase ? 'purchase' : 'detail');
        setItemDataForPurchase(
          shouldOpenPurchase ? initialItemDataForPurchase : null,
        );
      }
    }, [isOpen, initialViewMode, initialItemDataForPurchase]);

    // ESCキーで閉じる
    useEffect(() => {
      if (!isOpen) return;

      const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
          onClose();
        }
      };

      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    const handleBackdropClick = useCallback(
      (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      },
      [onClose],
    );

    const handlePurchaseClick = useCallback((itemData: ItemDataForPurchase) => {
      setItemDataForPurchase(itemData);
      setViewMode('purchase');
    }, []);

    const handleBackFromPurchase = useCallback(() => {
      setViewMode('detail');
    }, []);

    const handlePurchaseComplete = useCallback(
      (data: FleaMarketPurchaseCompleteData) => {
        onPurchaseComplete?.(data);
        onClose();
      },
      [onPurchaseComplete, onClose],
    );

    if (!isOpen) return null;

    const content = (
      <div
        className="fixed inset-0 z-[9999] flex items-end justify-center bg-black/60"
        onClick={handleBackdropClick}
      >
        {/* コンテナ */}
        <div
          className="relative w-full overflow-hidden rounded-t-[15px] bg-white shadow-2xl md:mx-4 md:mb-5 md:max-w-[500px] md:rounded-b-[15px]"
          style={{ height: viewMode === 'detail' ? '60vh' : '70vh' }}
          onClick={(e) => e.stopPropagation()}
        >
          {viewMode === 'detail' ? (
            <FleaMarketItemDetailCompact
              itemId={itemId}
              onBack={onClose}
              onPurchase={handlePurchaseClick}
            />
          ) : itemDataForPurchase ? (
            <FleaMarketPurchaseCompact
              item={itemDataForPurchase}
              onBack={handleBackFromPurchase}
              onPurchaseComplete={handlePurchaseComplete}
            />
          ) : null}
        </div>
      </div>
    );

    // bodyにポータルで描画
    if (typeof document !== 'undefined') {
      return createPortal(content, document.body);
    }

    return null;
  },
);

FleaMarketItemOverlay.displayName = 'FleaMarketItemOverlay';

export default FleaMarketItemOverlay;
