import type { JamboResponseData } from '@/types/JamboApi';

export type UtageWebBannerLinksResponseData = JamboResponseData & {
  readonly title: string;
  readonly image: string;
  readonly target: string;
};
