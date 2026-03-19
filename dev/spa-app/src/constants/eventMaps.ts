import { EventProvider } from './eventProviders';
import { event } from './ga4Event';

/**
 * GA4イベント名からeventオブジェクトのキーへの逆引きマップ
 * O(1)で高速検索可能
 *
 * 使用例: GA4_TO_EVENT_KEY_MAP['sign_up'] → 'sign_up'
 */
export const GA4_TO_EVENT_KEY_MAP = Object.fromEntries(
  Object.entries(event)
    .filter(([_, config]) => config[EventProvider.GA4])
    .map(([key, config]) => [config[EventProvider.GA4], key]),
) as Record<string, keyof typeof event>;

/**
 * EventTokenConfigオブジェクトからeventオブジェクトのキーへの逆引きマップ
 * O(1)で高速検索可能
 *
 * 使用例: CONFIG_TO_EVENT_KEY_MAP.get(event.sign_up) → 'sign_up'
 */
export const CONFIG_TO_EVENT_KEY_MAP = new Map<any, keyof typeof event>(
  Object.entries(event).map(([key, config]) => [
    config,
    key as keyof typeof event,
  ]),
);
