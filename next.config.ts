import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Inline critical CSS and defer the rest to eliminate render-blocking stylesheet
    optimizeCss: true,
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, s-maxage=31536000, stale-while-revalidate=31536000",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
