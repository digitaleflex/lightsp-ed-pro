import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  /* config options here */
  // Paquets Node natifs/serveur : ne pas bundler (Lighthouse local)
  serverExternalPackages: ["lighthouse", "chrome-launcher"],
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  // Masquer l'indicateur de développement Next.js (badge "N")
  devIndicators: false,
};

export default nextConfig;
