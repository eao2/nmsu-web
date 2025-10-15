// next.config.ts (Frontend)
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: true,
  },
  images: {
    loader: 'custom',
    loaderFile: './lib/image-loader.ts',
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**', 
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: '**', 
        pathname: '/**',
      },
    ],
  },
  async rewrites() {
    console.log('🔄 Rewrites loaded - proxying /api/* to https://nmsu.ne-to.com/api/*');
    return [
      {
        source: '/api/:path((?!auth).*)',
        destination: 'https://nmsu.ne-to.com/api/:path*',
      },
    ];
  },
  async headers() {
    return [
      {
        source: '/manifest.json',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/manifest+json',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;