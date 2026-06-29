type AnalyticsPayload = Record<string, string | number | boolean | undefined>;

export function trackEvent(event: string, payload: AnalyticsPayload = {}) {
  console.log('[analytics]', event, {
    ...payload,
    timestamp: new Date().toISOString(),
  });
}

export function trackSessionStart() {
  trackEvent('session_start');
}

export function trackSessionDuration(startedAt: number) {
  trackEvent('session_duration', { seconds: Math.round((Date.now() - startedAt) / 1000) });
}
