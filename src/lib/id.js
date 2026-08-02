/**
 * Generates a short, sufficiently-unique id for locally stored records.
 * Not cryptographically secure - this app has no server and no multi-user
 * collisions to worry about, so a timestamp + random suffix is enough.
 */
export function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}
