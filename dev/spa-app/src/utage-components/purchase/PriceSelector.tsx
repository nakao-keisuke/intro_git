// TODO: i18n - import { useTranslations } from '#/i18n';
import type {
  BonusPointPackage,
  PointPackage,
} from '@/constants/pointPackages';

type Package = PointPackage | BonusPointPackage;

/** ボーナスパッケージかどうかを判定 */
const isBonusPackage = (pkg: Package): pkg is BonusPointPackage => {
  return 'beforePoint' in pkg && pkg.isBonusExist === true;
};

type Props = {
  packages: Package[];
  selectedPackage: Package | null;
  onSelect: (pkg: Package) => void;
  /** 人気ラベルを表示するパッケージの金額 */
  popularMoney?: number;
  /** お得ラベルを表示するパッケージのポイント数 */
  dealPoint?: number;
};

/**
 * 価格選択リストコンポーネント
 * ラジオボタン形式で価格帯を表示
 */
const PriceSelector = ({
  packages,
  selectedPackage,
  onSelect,
  popularMoney,
  dealPoint,
}: Props) => {
  const t = useTranslations('pointShortage');
  return (
    <div className="flex flex-col gap-2">
      {packages.map((pkg) => {
        const isSelected = selectedPackage?.money === pkg.money;
        const isBonus = isBonusPackage(pkg);
        // ボーナスパッケージの場合はボーナスラベルを優先
        const isPopular = !isBonus && pkg.money === popularMoney;
        const isDeal = !isBonus && pkg.point === dealPoint;

        return (
          <button
            key={pkg.packageId}
            type="button"
            onClick={() => onSelect(pkg)}
            className={`relative flex w-full items-center justify-between rounded-lg border-2 px-4 py-3 transition-all duration-200 ${
              isSelected
                ? 'border-pink-400 bg-pink-50'
                : 'border-gray-200 bg-white hover:border-gray-300'
            }
            `}
          >
            {/* ボーナスラベル（最優先） */}
            {isBonus && (
              <span className="absolute -top-2 left-3 rounded-full bg-green-500 px-2 py-0.5 font-bold text-white text-xs">
                {t('bonusLabel')}
              </span>
            )}
            {/* 人気ラベル */}
            {isPopular && (
              <span className="absolute -top-2 left-3 rounded-full bg-gradient-to-r from-yellow-300 to-amber-400 px-2 py-0.5 font-bold text-amber-900 text-xs">
                {t('popularLabel')}
              </span>
            )}
            {isDeal && (
              <span className="absolute -top-2 left-3 animate-pulse rounded-full bg-gradient-to-r from-red-500 to-orange-500 px-2 py-0.5 font-bold text-white text-xs">
                {t('bestDealLabel')}
              </span>
            )}

            {/* 左側: ラジオボタン + ポイント情報 */}
            <div className="flex items-center gap-3">
              <input
                type="radio"
                className="h-4 w-4 accent-pink-500"
                checked={isSelected}
                readOnly
              />
              <div>
                <div className="mt-1 flex items-center gap-2">
                  <span className="font-bold text-gray-700 text-lg">
                    {pkg.point.toLocaleString()}pt
                  </span>
                  {isBonus && (
                    <span className="flex items-center gap-1 rounded border border-orange-300 bg-yellow-100 px-2 py-1 text-orange-600 text-xs">
                      {/* ボーナス時は元ポイント → 増量後ポイント (+増量分) */}
                      <span className="font-medium text-orange-600 text-xs">
                        {t('normalLabel')}
                        {pkg.beforePoint.toLocaleString()}pt
                      </span>
                      <span className="font-bold text-red-500 text-xs">
                        +{(pkg.point - pkg.beforePoint).toLocaleString()}pt
                      </span>
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* 右側: 金額 */}
            <span className="font-bold text-gray-500 text-lg">
              ¥{pkg.money.toLocaleString()}
            </span>
          </button>
        );
      })}
    </div>
  );
};

export default PriceSelector;
