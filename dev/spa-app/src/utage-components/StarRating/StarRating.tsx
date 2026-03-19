type PartialStarProps = {
  fillPercent: number;
  size?: number | undefined;
};

/**
 * 部分的に塗りつぶされた星を表示するコンポーネント
 * 枠線のある星（☆）の上に塗りつぶし星（★）を重ねて部分塗りつぶしを実現
 * @param fillPercent - 塗りつぶし率（0-100）
 * @param size - 星のサイズ（px）
 */
const PartialStar = ({ fillPercent, size }: PartialStarProps) => {
  const clampedPercent = Math.max(0, Math.min(100, fillPercent));

  const sizeStyle = size
    ? { width: size, height: size, fontSize: size }
    : undefined;

  return (
    <span
      className={`relative inline-flex items-center justify-center leading-none ${size ? '' : 'w-[1em] text-sm'}`}
      style={sizeStyle}
    >
      {/* 背景：枠線のみの星 */}
      <span className="text-[#F69E2C]">☆</span>
      {/* 前景：塗りつぶし星（クリップで部分表示） */}
      <span
        className="absolute top-0 left-0 overflow-hidden text-[#F69E2C]"
        style={{ width: `${clampedPercent}%` }}
      >
        ★
      </span>
    </span>
  );
};

export type StarRatingProps = {
  /** スコア（0-5） */
  score: number;
  /** カスタムクラス名 */
  className?: string;
  /** 星のサイズ（px） */
  size?: number;
};

/**
 * スコアに基づいて星評価を表示するコンポーネント
 * 例: 3.4 → ★★★（4つ目が40%塗りつぶし）☆
 */
const StarRating = ({ score, className = '', size }: StarRatingProps) => {
  // スコアを0-5の範囲にクランプ
  const clampedScore = Math.max(0, Math.min(5, score));

  return (
    <div className={`flex items-center justify-center gap-0.5 ${className}`}>
      {[...Array(5)].map((_, index) => {
        const starNumber = index + 1;
        let fillPercent: number;

        if (clampedScore >= starNumber) {
          fillPercent = 100;
        } else if (clampedScore > starNumber - 1) {
          fillPercent = (clampedScore - (starNumber - 1)) * 100;
        } else {
          fillPercent = 0;
        }

        return (
          <PartialStar
            key={`star-${starNumber}`}
            fillPercent={fillPercent}
            size={size}
          />
        );
      })}
    </div>
  );
};

export default StarRating;
