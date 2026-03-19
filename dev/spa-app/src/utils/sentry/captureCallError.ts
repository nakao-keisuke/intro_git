import * as Sentry from '@sentry/nextjs';
import type { CallErrorCategory } from '@/types/callErrorCategory';

export const captureCallError = (
  error: unknown,
  category: CallErrorCategory,
  callContext: {
    callType: string;
    partnerId?: string | undefined;
    callDurationSec?: number | undefined;
    [key: string]: unknown;
  },
) => {
  Sentry.withScope((scope) => {
    scope.setTag('feature', 'call');
    scope.setTag('call.error_category', category);
    scope.setTag('call.type', callContext.callType);
    if (callContext.partnerId) {
      scope.setTag('call.partner_id', callContext.partnerId);
    }
    scope.setContext('call_info', callContext);
    if (error instanceof Error) {
      Sentry.captureException(error);
    } else {
      Sentry.captureMessage(String(error), 'error');
    }
  });
};

export const captureCallWarning = (
  message: string,
  category: CallErrorCategory,
  callContext: Record<string, unknown>,
  level: Sentry.SeverityLevel = 'warning',
) => {
  Sentry.withScope((scope) => {
    scope.setTag('feature', 'call');
    scope.setTag('call.error_category', category);
    if (typeof callContext.callType === 'string') {
      scope.setTag('call.type', callContext.callType);
    }
    scope.setContext('call_info', callContext);
    Sentry.captureMessage(message, level);
  });
};
