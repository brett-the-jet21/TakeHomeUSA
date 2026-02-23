import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        // Legacy: /:state/:amount-salary-after-tax → /salary/:amount-salary-after-tax-:state
        source: "/:state([a-z][a-z-]*)/:amount(\\d+)-salary-after-tax",
        destination: "/salary/:amount-salary-after-tax-:state",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
