import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://51.175.105.40:3001/api/:path*',
      },
    ];
  },
};

export default nextConfig;
