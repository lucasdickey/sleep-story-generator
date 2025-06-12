import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Disable Pages Router features that might cause conflicts
  pageExtensions: ["tsx", "ts"],
  // Ensure clean builds
  cleanDistDir: true,
  // Optimize for production
  poweredByHeader: false,
  // Prevent any pages/_document interference
  trailingSlash: false,
  /* config options here */
};

export default nextConfig;
