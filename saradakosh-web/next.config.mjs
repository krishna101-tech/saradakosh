/** @type {import('next').NextConfig} */

// This non-secret origin must be copied from the selected Clerk instance, never
// from an incoming Host header. Keep the existing policy and add only auth hosts.
const clerkFrontendOrigin = process.env.CLERK_FRONTEND_API_ORIGIN;
if (!clerkFrontendOrigin || !/^https:\/\/[a-z0-9.-]+$/.test(clerkFrontendOrigin)) {
  throw new Error('CLERK_FRONTEND_API_ORIGIN must be the selected Clerk HTTPS origin.');
}
const developmentScripts = process.env.NODE_ENV === 'development' ? " 'unsafe-eval'" : '';
const developmentConnections = process.env.NODE_ENV === 'development' ? ' ws://localhost:3100' : '';

const cspHeader = `
  default-src 'self';
  connect-src 'self' https://api.web3forms.com ${clerkFrontendOrigin} https://*.protect.clerk.com:*${developmentConnections};
  script-src 'self' 'unsafe-inline' https://vercel.live ${clerkFrontendOrigin} https://challenges.cloudflare.com https://*.protect.clerk.com${developmentScripts};
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  img-src * blob: data:;
  font-src 'self' https://fonts.gstatic.com;
  object-src 'none';
  base-uri 'self';
  form-action 'self';
  frame-ancestors 'none';
  frame-src 'self' https://notebooklm.google.com https://challenges.cloudflare.com https://*.protect.clerk.com;
  worker-src 'self' blob:;
  ${process.env.NODE_ENV === 'development' ? '' : 'upgrade-insecure-requests;'}
`.replace(/\n/g, '');

const nextConfig = {
  outputFileTracingIncludes: {
    '/*': ['./saradakosh.db', './package.json'],
    '/classes/transcripts/**': ['./data/class-transcripts/*.json.gz'],
  },
  async rewrites() {
    return [
      {
        source: '/sitemap.xml',
        destination: '/sitemap-index',
      },
    ];
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), browsing-topics=()' },
          { key: 'Content-Security-Policy', value: cspHeader },
          { key: 'Access-Control-Allow-Origin', value: 'https://www.saradakosh.org' }
        ],
      },
    ];
  },
};

import { withSentryConfig } from '@sentry/nextjs';

export default withSentryConfig(nextConfig, {
  // For all available options, see:
  // https://github.com/getsentry/sentry-webpack-plugin#options
  org: "saradakosh-org",
  project: "saradakosh-web",
  silent: !process.env.CI,
  widenClientFileUpload: true,
  hideSourceMaps: true,
  disableLogger: true,
  automaticVercelMonitors: true,
});
