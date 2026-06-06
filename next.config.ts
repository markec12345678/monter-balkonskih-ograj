import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  serverExternalPackages: ['pako', 'iobuffer'],
  transpilePackages: ['nanoid', 'yet-another-react-lightbox', 'react-photo-album'],
};

export default nextConfig;
