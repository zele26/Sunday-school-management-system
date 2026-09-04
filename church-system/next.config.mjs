const isStandalone = process.env.DOCKER_BUILD === '1' || process.env.OUTPUT_STANDALONE === 'true';

/** @type {import('next').NextConfig} */
const nextConfig = {
  ...(isStandalone ? { output: 'standalone' } : {}),
  reactStrictMode: false, // Disables double-rendering in development for 2x faster performance
  poweredByHeader: false,
  compress: true,
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
    ],
  },
  experimental: {
    optimizePackageImports: [
      'react-router-dom',
      'qrcode.react',
      'xlsx',
      'zustand',
      'html5-qrcode',
    ],
  },
  async rewrites() {
    const backendUrl = process.env.BACKEND_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    return [
      {
        source: '/api/:path*',
        destination: `${backendUrl}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;

