const CROCKFORD_BASE32_ALPHABET = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";
const RANDOM_ID_LENGTH = 26;

export const generateRandomId = (prefix: string) => {
  const bytes = new Uint8Array(RANDOM_ID_LENGTH);
  crypto.getRandomValues(bytes);

  let value = "";

  for (const byte of bytes) {
    value += CROCKFORD_BASE32_ALPHABET[byte & 31]!;
  }

  return `${prefix}_${value}`;
};
