import type React from 'react';

interface StarRatingProps {
  rating: string;
  label?: string;
  className?: string;
  filledColor?: string;
  emptyColor?: string;
}

/**
 * 星評価を表示するコンポーネント
 * @param rating 星評価の文字列（例: "★★★☆☆"）
 * @param label ラベル（例: "Hレベル:"）
 * @param className 追加のCSSクラス
 * @param filledColor 塗りつぶされた星の色（デフォルト: #F69E2C）
 * @param emptyColor 空の星の色（デフォルト: inherit）
 */
const StarRating: React.FC<StarRatingProps> = ({
  rating,
  label,
  className = '',
  filledColor = '#F69E2C',
  emptyColor = 'inherit',
}) => {
  if (!rating || rating === '未設定') {
    return null;
  }

  return (
    <div className={className}>
      {label && <span>{label} </span>}
      {rating.split('').map((star, index) => (
        <span
          key={index}
          style={{
            color: star === '★' ? filledColor : emptyColor,
          }}
        >
          {star}
        </span>
      ))}
    </div>
  );
};

export default StarRating;
