import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  // Masquer l'indicateur de développement Next.js (badge "N")
  devIndicators: false,
};

export default nextConfig;
