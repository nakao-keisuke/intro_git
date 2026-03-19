// Image component removed (use <img> directly);
import { useNavigate } from '@tanstack/react-router';
import { useSession } from '#/hooks/useSession';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import AppPayNoModal from '@/app/components/AppPayNoModal';
import { event } from '@/constants/ga4Event';
import { PRICING_INFO } from '@/constants/pricing';
import { useSendSticker } from '@/hooks/useSendSticker';
import { usePointStore } from '@/stores/pointStore';
import styles from '@/styles/chat/Stamp.module.css';
import { trackEvent } from '@/utils/eventTracker';

type StampImage = {
  url: string;
  categoryId: string;
  name: string;
  number: number;
};

type Props = {
  onClose: () => void;
  images: StampImage[];
  partnerId: string | string[] | undefined;
};

const Gift: React.FC<Props> = ({ onClose, images, partnerId }) => {
  const router = useRouter();
  const { data: session } = useSession();
  const [notEnoughPointModalOpen, setNotEnoughPointModalOpen] = useState(false);
  const updatePointOptimistic = usePointStore((s) => s.updatePointOptimistic);
  const { sendSticker, isLoading } = useSendSticker();

  // ギフト送信の価格を取得（メッセージ送信と同じ）
  const giftPrice =
    (PRICING_INFO.find((item) => item.label === 'メッセージ送信')
      ?.price as number) || 60;

  const categories = useMemo(() => {
    //適用するギフトスタンプ
    const GIFT_CATEGORY = [
      //ギフトスタンプ
      '60dd10dd26bfcf779b113833',
      '60dd13a426bfcf779b11389e',
    ];

    // imagesが配列でない場合のガード
    if (!Array.isArray(images)) {
      console.warn('Gift component: images prop is not an array', images);
      return [];
    }

    const grouped = images
      .filter((image) => GIFT_CATEGORY.includes(image.categoryId))
      .reduce(
        (acc, image) => {
          if (!acc[image.categoryId]) {
            acc[image.categoryId] = [];
          }
          acc[image.categoryId]?.push(image);
          return acc;
        },
        {} as Record<string, StampImage[]>,
      );

    return Object.entries(grouped).map(([categoryId, categoryImages]) => ({
      categoryId,
      thumbnailImage: categoryImages[0],
      images: categoryImages,
    }));
  }, [images]);

  // 選択中のカテゴリー
  const [selectedCategory, setSelectedCategory] = useState('');

  // categoriesが更新されたら最初のカテゴリーを選択
  useEffect(() => {
    if (categories.length > 0 && !selectedCategory && categories[0]) {
      setSelectedCategory(categories[0].categoryId);
    }
  }, [categories, selectedCategory]);

  const validateAndSend = async (image: StampImage) => {
    if (isLoading) {
      return;
    }

    const value = `${image.categoryId}_${image.name}`;
    const partnerIdString = Array.isArray(partnerId)
      ? partnerId.length > 0
        ? partnerId[0]
        : undefined
      : partnerId;

    if (!partnerIdString) {
      return;
    }

    // ✅ 即座にポイントを減らす（楽観的更新）
    updatePointOptimistic(-giftPrice);

    const result = await sendSticker(partnerIdString, value);

    if (!result.success) {
      // ❌ エラー時はロールバック
      updatePointOptimistic(giftPrice);

      if (result.notEnoughPoint) {
        setNotEnoughPointModalOpen(true);
        return;
      }
      toast.error('ギフトの送信に失敗しました。再度お試しください。');
      return;
    }

    // GA4・Reproイベント送信
    trackEvent(event.COMPLETE_SEND_GIFT, {
      partner_id: partnerIdString,
      user_id: session?.user?.id,
    });

    // ✅ 成功: ポーリングで同期（3秒後、自動）

    router.refresh();
  };

  const modalClose = (event: React.MouseEvent) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className={styles.modalBackdrop}
      onClick={(event) => modalClose(event)}
    >
      <div className={styles.modalContent}>
        {/* カテゴリー選択エリア */}
        {isLoading && <div className={styles.loader} />}
        <div className={styles.categorySelector}>
          {categories.map((category) => (
            <div
              key={category.categoryId}
              className={`${styles.categoryItem} ${
                selectedCategory === category.categoryId
                  ? styles.selectedCategory
                  : ''
              }`}
              onClick={() => setSelectedCategory(category.categoryId)}
            >
              <Image
                src={category.thumbnailImage?.url ?? ''}
                width={40}
                height={40}
                alt={`カテゴリー${category.categoryId}`}
                style={{
                  objectFit: 'contain',
                }}
              />
            </div>
          ))}
        </div>

        {/* ギフトスタンプ表示エリア */}
        <div className={styles.stickerGrid}>
          {categories
            .find((category) => category.categoryId === selectedCategory)
            ?.images.map((image) => (
              <Image
                key={image.number}
                src={image.url}
                placeholder="empty"
                width={90}
                height={90}
                style={{
                  objectFit: 'contain',
                  marginLeft: 0,
                  cursor: 'pointer',
                }}
                alt={`ギフトスタンプ${image.number}`}
                className={styles.stickerId}
                onClick={() => validateAndSend(image)}
              />
            )) ?? <p>ギフトスタンプがありません</p>}
        </div>
      </div>
      {notEnoughPointModalOpen && (
        <AppPayNoModal onClose={() => setNotEnoughPointModalOpen(false)} />
      )}
    </div>
  );
};

export default Gift;
