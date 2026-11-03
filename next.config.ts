import type { NextConfig } from "next";

// Shown in the app footer and sent with tracking events, so we can tell
// whether the installed PWA runs the latest deploy.
const commit = process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? "dev";
const built = new Date().toLocaleString("cs-CZ", {
  timeZone: "Europe/Prague",
  day: "numeric",
  month: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

const nextConfig: NextConfig = {
  turbopack: {},
  env: {
    NEXT_PUBLIC_APP_VERSION: `${commit} · ${built}`,
  },
};

export default nextConfig;
