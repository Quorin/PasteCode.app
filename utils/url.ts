export const getBaseUrl = () => {
  return process.env.APP_URL
    ? `https://${process.env.APP_URL}`
    : process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : 'http://localhost:3000'
}
