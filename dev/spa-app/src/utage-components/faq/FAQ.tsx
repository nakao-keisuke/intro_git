import { AccountFaq } from './AccountFaq';
import { BeginnersFaq } from './BeginnerFaq';
import { BenefitsFaq } from './BenefitsFaq';
import { ConnectionFaq } from './ConnectionFaq';
import { FleaMarketFaq } from './FleaMarketFaq';
import { GirlsFaq } from './GirlsFaq';
import { PointFaq } from './PointFaq';

export { AccountFaq } from './AccountFaq';
export { BeginnersFaq } from './BeginnerFaq';
export { BenefitsFaq } from './BenefitsFaq';
export { ConnectionFaq } from './ConnectionFaq';
export { FleaMarketFaq } from './FleaMarketFaq';
export { GirlsFaq } from './GirlsFaq';
export { PointFaq } from './PointFaq';

// カテゴリーとコンポーネントのマッピング
export const categoryComponents = {
  beginner: BeginnersFaq,
  account: AccountFaq,
  point: PointFaq,
  connection: ConnectionFaq,
  benefits: BenefitsFaq,
  girls: GirlsFaq,
  fleamarket: FleaMarketFaq,
} as const;

export type CategorySlug = keyof typeof categoryComponents;
