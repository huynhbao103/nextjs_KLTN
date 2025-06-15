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
      'res.cloudinary.com',
      'lh3.googleusercontent.com'
    ],
  },
}

module.exports = nextConfig 