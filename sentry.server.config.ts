

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://6266e9eeb2bc4c48caaf657673efde0a@o4511387329036288.ingest.us.sentry.io/4511387367768064",

  integrations: [
    // send console.log, console.warn, and console.error calls as logs to Sentry
    Sentry.consoleLoggingIntegration({ levels: ["log", "warn", "error"] }),
  ],
  
  tracesSampleRate: 1,

  // Enable logs to be sent to Sentry
  enableLogs: true,

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,
});
