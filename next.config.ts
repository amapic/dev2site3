import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  distDir: process.env.NEXT_BUILD_DIR || 'dist',
  devIndicators: false,
  typescript: {
    ignoreBuildErrors: true,
  },
};


export default nextConfig;
