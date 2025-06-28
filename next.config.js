/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Ensure API routes are handled dynamically
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
  // Add headers for external APIs
  async headers() {
    return [
      {
        source: '/api/geocode',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization',
          },
        ],
      },
      {
        source: '/api/weather',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization',
          },
        ],
      },
    ];
  },
}

module.exports = nextConfig 