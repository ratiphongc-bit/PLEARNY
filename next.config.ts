import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Allow all local public images without domain restriction
    unoptimized: false,
    remotePatterns: [],
  },
  // Allow cross-origin for fonts, etc.
  experimental: {},
  allowedDevOrigins: ["127.0.0.1"],
};

export default nextConfig;
