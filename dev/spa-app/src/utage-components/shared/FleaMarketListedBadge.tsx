// Image component removed (use <img> directly);

const fleaMarketIcon = '/setting_icon/fleamarket.webp';

type Props = {
  className?: string;
  /** バッジに表示するラベル（デフォルト: 出品中） */
  label?: string;
};

const FleaMarketListedBadge = ({ className, label = '出品中' }: Props) => (
  <>
    <style jsx>{`
      @keyframes scale-pulse {
        0%,
        100% {
          transform: scale(0.9);
        }
        50% {
          transform: scale(1);
        }
      }
      .scale-animation {
        animation: scale-pulse 1.5s ease-in-out infinite;
      }
    `}</style>
    <div
      className={`absolute top-[-2px] left-[-2px] z-20 flex scale-animation items-center gap-1 whitespace-nowrap rounded-full bg-pink-400 px-2 py-1 ${
        className ?? ''
      }`}
    >
      <Image
        src={fleaMarketIcon}
        alt="フリマアイコン"
        width={16}
        height={16}
        className="shrink-0 brightness-0 invert"
      />
      <span className="whitespace-nowrap font-bold text-white text-xs">
        {label}
      </span>
    </div>
  </>
);

export default FleaMarketListedBadge;
