import type { NextConfig } from "next";
/** @type {import('next').NextConfig} */
const nextConfig = {
  logging: {
    fetches: {
      fullUrl: false, // Prevents giant API fetch strings from printing
    },
  },
  experimental: {
    viewTransition: true,
    workerThreads: true,
    cpus: 4,
  },
  // If you are on Next.js 14/15, you can turn off the server logging overlay:
  devIndicators: {
    appIsrStatus: false,
  }
};

module.exports = nextConfig;
export default nextConfig;