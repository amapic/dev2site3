import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  distDir: 'dist',
  devIndicators: false,
  typescript: {
    ignoreBuildErrors: true,
  },
};


export default nextConfig;
