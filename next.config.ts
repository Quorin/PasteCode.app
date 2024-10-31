import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  transpilePackages: ['shiki'],
  reactStrictMode: true,
  experimental: {
    ppr: true,
  },
}

export default nextConfig
