import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  devIndicators: {
    appIsrStatus: false,
    buildActivityPosition: 'bottom-right',
    buildActivity: false,
  } as any,
};

export default nextConfig;
