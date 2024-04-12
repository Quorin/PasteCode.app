/** @type {import("next").NextConfig} */
const nextConfig = {
  transpilePackages: ['shiki'],
  reactStrictMode: true,
  experimental: {
    ppr: true,
  },
}

export default nextConfig
