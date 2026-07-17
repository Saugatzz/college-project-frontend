import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'encrypted-tbn0.gstatic.com',
      },
      // add any other image hosts you use here, e.g.:
      // { protocol: 'https', hostname: 'your-backend-domain.com' },
      // { protocol: 'https', hostname: 'res.cloudinary.com' },
    ],
  },
  /* other config options here */
};

export default nextConfig;