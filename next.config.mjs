/** @type {import("next").NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.optimization.concatenateModules = false
    }

    return config
  },
}

export default nextConfig
