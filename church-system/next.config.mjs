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
      'lucide-react',
      'framer-motion',
      '@tanstack/react-query',
      'react-router-dom',
      'qrcode.react',
      'xlsx',
      'zustand',
      'html5-qrcode',
      'canvas-confetti',
    ],
  },
  async headers() {
    return [
      {
        source: '/:all*(svg|jpg|png|webp|avif|woff2|woff|ico)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
  async rewrites() {
    const defaultUrl = process.env.NODE_ENV === 'development' ? 'http://localhost:5000' : 'https://church-api-3l2c.onrender.com';
    const backendUrl = process.env.BACKEND_API_URL || process.env.NEXT_PUBLIC_API_URL || defaultUrl;
    return [
      {
        source: '/api/:path*',
        destination: `${backendUrl.replace(/\/+$/, '')}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;

