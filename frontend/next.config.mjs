/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3001',
        pathname: '/uploads/**',
      },
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'mcq-api.lrdevteam.com',
      },
      {
        protocol: 'https',
        hostname: 'lr-mcq.s3.ap-south-1.amazonaws.com',
      },
    ],
  },
};

export default nextConfig;
