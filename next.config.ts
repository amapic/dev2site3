import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  distDir: 'dist',
  output: 'export',
  devIndicators: false,
  typescript: {
    ignoreBuildErrors: true,
  },
};


export default nextConfig;
