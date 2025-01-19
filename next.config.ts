import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config, { dev }) => {
    // Disable cache in development
    if (dev) {
      config.cache = false;
    }
    return config;
  },
};

export default nextConfig;