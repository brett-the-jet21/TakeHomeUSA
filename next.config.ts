import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  experimental: {
    // Inline critical CSS and defer the rest to eliminate render-blocking stylesheet
    optimizeCss: true,
  },
};

export default nextConfig;
