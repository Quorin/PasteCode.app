import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  experimental: {
    ppr: true,
    authInterrupts: true,
  },
  outputFileTracingIncludes: {
    '/*': ['./node_modules/argon2/prebuilds/linux-x64/*'],
  },
}

export default nextConfig
