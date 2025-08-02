/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['bcryptjs'],
    optimizePackageImports: ['framer-motion', 'lucide-react'],
  },
  images: {
    domains: [
      'images.unsplash.com',
      'unsplash.com',
      'avatars.githubusercontent.com',
      'github.com',
      'res.cloudinary.com',
      'lh3.googleusercontent.com',
      'openweathermap.org'
    ],
  },
  // Tối ưu hóa performance
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  // Tối ưu hóa bundle
  webpack: (config, { dev, isServer }) => {
    if (!dev && !isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
          },
        },
      };
    }
    return config;
  },
  // Tối ưu hóa headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET, POST, PUT, DELETE, OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
          // Thêm cache headers
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      {
        source: '/api/(.*)',
        headers: [
          { key: 'Cache-Control', value: 'no-cache, no-store, must-revalidate' },
        ],
      },
    ];
  },
};
export default nextConfig;

