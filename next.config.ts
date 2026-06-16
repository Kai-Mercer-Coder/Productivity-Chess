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
  devIndicators: {
    appIsrStatus: false,
  }
};

module.exports = nextConfig;
export default nextConfig;