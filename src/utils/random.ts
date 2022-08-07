const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

export const generateRandomString = (length: number): string =>
  Array(length)
    .join()
    .split(",")
    .map(() => chars.charAt(Math.floor(Math.random() * chars.length)))
    .join("");
