const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'

export const generateRandomString = (length: number): string => {
  const array = new Uint8Array(length)

  crypto.getRandomValues(array)

  return Array.from(array)
    .map((num) => chars[num % chars.length])
    .join('')
}
