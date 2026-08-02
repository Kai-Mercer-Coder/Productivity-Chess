import type { NextConfig } from "next";

/** @type {import('next').NextConfig} */
const nextConfig = {
  logging: {
    fetches: {
      fullUrl: false,
    },
  },
  experimental: {
    viewTransition: true,
    // FIX 1: Turn off worker threads or drop down to 1 CPU core to prevent multiple Node instances
    workerThreads: false,
    cpus: 1,

    // FIX 2: Stop Next.js from aggressively preloading every page into RAM at startup
    preloadEntriesOnStart: false,
  },
  devIndicators: {
    appIsrStatus: false,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

module.exports = nextConfig;
export default nextConfig;
