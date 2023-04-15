/** @type {import("next").NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack(config) {
    config.resolve.alias.argon2 = false

    return config
  },
}

export default nextConfig
