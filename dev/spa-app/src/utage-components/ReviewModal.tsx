// Image component removed (use <img> directly);
import type React from 'react';
import { useState } from 'react';
import { getBadgeBackgroundColor, MANUAL_BADGES } from '@/constants/badges';
import { event } from '@/constants/ga4Event';
import { useBadgeGrantStatus } from '@/hooks/requests/useBadgeGrantStatus';
import { useBadgeProgress } from '@/hooks/requests/useBadgeProgress';
import { useGrantBadge } from '@/hooks/requests/useGrantBadge';
import { usePostUserReview } from '@/hooks/requests/usePostUserReview';
import { useReviewPostingEnabled } from '@/hooks/useReviewPostingEnabled';
import styles from '@/styles/ReviewModal.module.css';
import { trackEvent } from '@/utils/eventTracker';

const MAX_DESCRIPTION_LENGTH = 200;

// 星評価用のStarコンポーネント
const Star: React.FC<{
  filled: boolean;
  onClick: () => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}> = ({ filled, onClick, onMouseEnter, onMouseLeave }) => (
  <button
    type="button"
    className="cursor-pointer text-3xl transition-colors duration-200"
    onClick={onClick}
    onMouseEnter={onMouseEnter}
    onMouseLeave={onMouseLeave}
    aria-label={filled ? '選択済み' : '未選択'}
  >
    <span className={filled ? 'text-amber-400' : 'text-gray-300'}>
      {filled ? '★' : '☆'}
    </span>
  </button>
);

// クラッカー風紙吹雪アニメーション用コンポーネント
const Confetti: React.FC = () => {
  return (
    <div className={styles.confettiWrapper}>
      {[...Array(80)].map((_, i) => {
        const angle = (360 / 80) * i + Math.random() * 20 - 10;
        const distance = 80 + Math.random() * 120;
        const rotation = Math.random() * 720 + 360;

        return (
          <div
            key={i}
            className={styles.confetti}
            style={
              {
                '--dx': `${Math.cos((angle * Math.PI) / 180) * distance}px`,
                '--dy': `${Math.sin((angle * Math.PI) / 180) * distance}px`,
                '--rotation': `${rotation}deg`,
                animationDelay: `${Math.random() * 0.2}s`,
              } as React.CSSProperties
            }
          />
        );
      })}
    </div>
  );
};

export const ReviewModal: React.FC<{
  targetUserId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  source?: 'profile' | 'call_end' | 'unknown';
}> = ({ targetUserId, isOpen, onClose, onSuccess, source = 'unknown' }) => {
  const [score, setScore] = useState(0);
  const [hoverScore, setHoverScore] = useState(0);
  const [description, setDescription] = useState('');
  const [selectedBadges, setSelectedBadges] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  // バッジ付与条件チェック
  const { canGrantBadge } = useBadgeGrantStatus(targetUserId);
  // レビュー投稿条件チェック
  const { canWriteReview } = useReviewPostingEnabled(targetUserId);

  // バッジ進捗取得（ローディング状態のみ使用）
  const { isLoading: badgesLoading } = useBadgeProgress(targetUserId);

  // フックはコンポーネントのトップレベルで呼び出す（Reactのルール）
  const { postReview } = usePostUserReview();
  const { grantBadge } = useGrantBadge();

  if (!isOpen) return null;

  // 成功メッセージの定義
  const SUCCESS_MESSAGES = {
    REVIEW_AND_BADGE: '投稿しました！',
    REVIEW_ONLY: 'レビューを投稿しました！',
    BADGE_ONLY: 'バッジを付与しました！',
  } as const;

  const isSuccess =
    message === SUCCESS_MESSAGES.REVIEW_AND_BADGE ||
    message === SUCCESS_MESSAGES.REVIEW_ONLY ||
    message === SUCCESS_MESSAGES.BADGE_ONLY;

  const handleSubmit = async () => {
    setSubmitting(true);
    setMessage(null);

    let reviewSubmitted = false;
    let badgeGranted = false;

    try {
      if ((score > 0 || description.length > 0) && !canWriteReview) {
        setMessage('レビュー投稿条件を満たしていません。');
        return;
      }
      // 1. レビュー投稿
      if (score > 0 || description.length > 0) {
        const result = await postReview(
          targetUserId,
          score,
          description,
          source,
        );

        if (!result.success) {
          setMessage(result.message || '投稿に失敗しました');
          return;
        }
        reviewSubmitted = true;
      }

      // 2. バッジ付与
      if (selectedBadges.length > 0 && canGrantBadge) {
        const result = await grantBadge(targetUserId, selectedBadges);

        if (!result.success) {
          setMessage('バッジ付与に失敗しました');
          return;
        }
        badgeGranted = true;
      }

      // 成功処理
      trackEvent(event.COMPLETE_SUBMIT_REVIEW, {
        target_user_id: targetUserId,
        source,
        badges_granted: selectedBadges.length,
      });

      // 成功メッセージを動的に設定
      const successMessage =
        reviewSubmitted && badgeGranted
          ? SUCCESS_MESSAGES.REVIEW_AND_BADGE
          : reviewSubmitted
            ? SUCCESS_MESSAGES.REVIEW_ONLY
            : SUCCESS_MESSAGES.BADGE_ONLY;
      setMessage(successMessage);

      setScore(0);
      setDescription('');
      setSelectedBadges([]);
      setTimeout(() => {
        setMessage(null);
        onClose();
        // レビュー投稿後にデータを再取得
        onSuccess?.();
      }, 1800);
    } catch (_e) {
      setMessage('予期せぬエラーが発生しました。');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleBadge = (badgeId: string) => {
    setSelectedBadges((prev) =>
      prev.includes(badgeId)
        ? prev.filter((id) => id !== badgeId)
        : [...prev, badgeId],
    );
  };

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/40 px-4 py-2 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative flex max-h-120px w-full max-w-md flex-col rounded-2xl bg-white"
        onClick={(e) => e.stopPropagation()}
      >
        {!isSuccess ? (
          <div className="flex flex-col px-5 pt-4 pb-4">
            {/* 閉じるボタン */}
            <button
              type="button"
              onClick={onClose}
              className="absolute top-3 right-3 text-2xl text-gray-400 transition-colors hover:text-gray-600"
              aria-label="閉じる"
            >
              ×
            </button>

            {/* タイトル */}
            <h2 className="text-center font-bold text-gray-800 text-lg">
              ビデオ通話レビュー
            </h2>
            {canGrantBadge && (
              <p className="mt-1 mb-3 text-center text-gray-500 text-xs">
                当てはまるバッジを選択(*複数選択可)
              </p>
            )}

            {/* バッジセクション（canGrantBadge が true の場合のみ表示） */}
            {canGrantBadge && (
              <div className="mb-3 max-h-[220px] overflow-y-auto px-1 py-2">
                <div className="grid grid-cols-3 gap-3">
                  {MANUAL_BADGES.map((badge) => {
                    const isSelected = selectedBadges.includes(badge.id);
                    const bgColor = getBadgeBackgroundColor(badge.id);

                    return (
                      <button
                        key={badge.id}
                        type="button"
                        onClick={() => toggleBadge(badge.id)}
                        disabled={submitting}
                        className={`flex flex-col items-center justify-center rounded-xl p-2 transition-all duration-200 ${bgColor}
                          ${isSelected ? 'ring-2 ring-pink-400 ring-offset-1' : ''}
                          ${submitting ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:scale-105'}
                        `}
                      >
                        <div className="relative mb-1 h-8 w-8">
                          <Image
                            src={badge.image}
                            alt={badge.name}
                            fill
                            className="object-contain"
                          />
                        </div>
                        <span className="text-center text-[10px] text-gray-700 leading-tight">
                          {badge.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 総合評価・感想セクション */}
            <div className="mb-3 rounded-2xl bg-amber-50 p-3">
              {/* 総合評価 */}
              <p className="mb-1 text-center text-gray-600 text-xs">
                総合評価<span className="text-gray-400">（星をタップ）</span>
              </p>
              <div className="mb-3 flex justify-center gap-1">
                {[1, 2, 3, 4, 5].map((n) => (
                  <Star
                    key={n}
                    filled={hoverScore ? n <= hoverScore : n <= score}
                    onClick={() => setScore(n)}
                    onMouseEnter={() => setHoverScore(n)}
                    onMouseLeave={() => setHoverScore(0)}
                  />
                ))}
              </div>

              {/* 感想 */}
              <p className="mb-1 text-gray-600 text-xs">感想</p>
              <textarea
                className="min-h-[70px] w-full resize-none rounded-xl border border-amber-200 bg-white p-2 text-sm transition-colors focus:border-amber-400 focus:outline-none"
                placeholder="かわいい!"
                value={description}
                onChange={(e) => {
                  if (e.target.value.length <= MAX_DESCRIPTION_LENGTH) {
                    setDescription(e.target.value);
                  }
                }}
                disabled={submitting}
                maxLength={MAX_DESCRIPTION_LENGTH}
              />
            </div>

            {/* エラーメッセージ */}
            {message && !isSuccess && (
              <p className="mb-2 text-red-500 text-sm">{message}</p>
            )}

            {/* 評価するボタン */}
            <button
              type="button"
              className={`w-full rounded-full py-3 font-bold text-base text-white transition-all duration-200 ${
                submitting ||
                badgesLoading ||
                (
                  score === 0 &&
                    description.length === 0 &&
                    selectedBadges.length === 0
                )
                  ? 'cursor-not-allowed bg-gray-300'
                  : 'bg-cyan-400 hover:bg-cyan-500'
              }`}
              onClick={handleSubmit}
              disabled={
                submitting ||
                badgesLoading ||
                (score === 0 &&
                  description.length === 0 &&
                  selectedBadges.length === 0)
              }
            >
              評価する
            </button>
          </div>
        ) : (
          <div className={styles.successContainer}>
            <Confetti />
            <p className={styles.successMessage}>レビューを投稿しました！</p>
          </div>
        )}
      </div>
    </div>
  );
};
