// This file configures the initialization of Sentry on the client.
// The added config here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

// 테스트 환경에서는 Sentry 초기화를 건너뜁니다
if (process.env.NODE_ENV !== "test") {
  Sentry.init({
    dsn: "https://67d3d09f16b265e6ff7e581ebdc1754e@o4509094208471040.ingest.us.sentry.io/4509094402850816",

    // Add optional integrations for additional features
    // replayIntegration은 현재 버전에서 지원되지 않아 제거합니다
    integrations: [],

    // Define how likely traces are sampled. Adjust this value in production, or use tracesSampler for greater control.
    tracesSampleRate: 1,

    // Define how likely Replay events are sampled.
    // This sets the sample rate to be 10%. You may want this to be 100% while
    // in development and sample at a lower rate in production
    replaysSessionSampleRate: 0.1,

    // Define how likely Replay events are sampled when an error occurs.
    replaysOnErrorSampleRate: 1.0,

    // Setting this option to true will print useful information to the console while you're setting up Sentry.
    debug: false,
  });
}
