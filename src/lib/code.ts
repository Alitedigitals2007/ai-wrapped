const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const CODE_LENGTH = 6;

export function generateCode(): string {
  const rand = new Uint8Array(CODE_LENGTH);
  crypto.getRandomValues(rand);
  let out = "";
  for (let i = 0; i < CODE_LENGTH; i++) {
    out += CODE_ALPHABET[rand[i] % CODE_ALPHABET.length];
  }
  return out;
}