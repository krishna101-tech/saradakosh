import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://2553fdb4ec0b44d0ae8440ac76c43cf0@o4511705450938368.ingest.us.sentry.io/4511705458868224",

  // Adjust this value in production, or use tracesSampler for greater control
  tracesSampleRate: 1,

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,
});
