/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['bcryptjs'],
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
  async headers() {
    return [
      {
        source: '/(.*)', // Áp dụng cho mọi route
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET, POST, PUT, DELETE, OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
        ],
      },
    ];
  },
};

export default nextConfig;
