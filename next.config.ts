import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Emit a self-contained server bundle (.next/standalone) so the production
  // Docker image can run `node server.js` without node_modules or pnpm.
  output: "standalone",
  async redirects() {
    return [
      // In-flight password-reset emails sent before the backend URL was
      // corrected point at /reset-password — forward them to the real route.
      // Next.js preserves the query string (`?token=…`) automatically.
      {
        source: "/reset-password",
        destination: "/forgot-password/reset",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
