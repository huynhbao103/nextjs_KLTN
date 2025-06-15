/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  images: {
    domains: [
      'images.unsplash.com', 
      'unsplash.com',
      'avatars.githubusercontent.com',
      'github.com',
      'res.cloudinary.com'
    ],
  },
}

module.exports = nextConfig 