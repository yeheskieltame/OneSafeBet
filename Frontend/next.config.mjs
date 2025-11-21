/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Add experimental features for Web3
  experimental: {
    // Enable SWC for faster builds
    swcMinify: true,
  },
}

export default nextConfig
