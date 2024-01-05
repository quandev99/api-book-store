import crypto from "crypto";

export const generateRandomCode = (length = 6) => {
  const randomBytes = crypto.randomBytes(Math.ceil(length / 2));
  const randomCode = randomBytes.toString("hex").slice(0, length);
  return randomCode.toUpperCase();
};
