/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.storage.c-9.us-east-1.aws.neon.tech',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
