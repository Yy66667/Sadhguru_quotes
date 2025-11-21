import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
   images: {
    domains: ["www.datocms-assets.com"],
  },
};

export default nextConfig;
