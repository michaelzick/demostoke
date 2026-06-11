// Constant-time string comparison for secrets (cron secrets, internal tokens).
// A plain `===` short-circuits on the first differing byte, which leaks the
// secret length and prefix to a timing attacker. This compares every byte.
export function timingSafeEqualString(a: string, b: string): boolean {
  const encoder = new TextEncoder();
  const aBytes = encoder.encode(a);
  const bBytes = encoder.encode(b);

  // Compare a fixed-length view so the loop count never depends on the secret.
  const length = Math.max(aBytes.length, bBytes.length);
  let mismatch = aBytes.length ^ bBytes.length;
  for (let i = 0; i < length; i++) {
    mismatch |= (aBytes[i] ?? 0) ^ (bBytes[i] ?? 0);
  }
  return mismatch === 0;
}
