// next.config.ts
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
  webpack: (config: any, { isServer } : any) => {
    if (isServer) {
      config.externals.push({
        'socket.io-client': 'socket.io-client',
      });
    }
    return config;
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
