import * as Sentry from '@sentry/nextjs';

export const addCallBreadcrumb = (
  message: string,
  category: string,
  data?: Record<string, unknown>,
  level: Sentry.SeverityLevel = 'info',
) => {
  Sentry.addBreadcrumb({
    message,
    category: `call.${category}`,
    level,
    ...(data && { data }),
    timestamp: Date.now() / 1000,
  });
};
