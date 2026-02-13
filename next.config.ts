import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ['192.168.15.8', '192.168.102.227'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'i.scdn.co',
      },
      {
        protocol: 'https',
        hostname: 'mosaic.scdn.co',
      },
      {
        protocol: 'https',
        hostname: 'wrapped-images.spotifycdn.com',
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
      },
    ],
  },
};

export default nextConfig;
