import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  experimental: {
    ppr: true,
  },
  outputFileTracingIncludes: {
    '/login': ['./node_modules/argon2/prebuilds/linux-x64/*'],
    '/register': ['./node_modules/argon2/prebuilds/linux-x64/*'],
  },
}

export default nextConfig
