/**
 * Generates a short, sufficiently-unique id for locally stored records.
 * Not cryptographically secure - this app has no server and no multi-user
 * collisions to worry about, so a timestamp + random suffix is enough.
 */
export function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

/**
 * When a record was created, recovered from its id: uid() starts with Date.now() in
 * base 36 (8 characters until 2059). Returns 0 for ids made some other way, such as
 * very old or hand-edited imports, so those simply sort last within their day.
 */
export function createdAtOf(record) {
  const ts = parseInt(String(record.id || "").slice(0, 8), 36);
  // Sanity range: 2020-01-01 to 2100-01-01.
  return ts > 1577836800000 && ts < 4102444800000 ? ts : 0;
}

/** Sort comparator: newest date first, and within a day, most recently added first. */
export function newestFirst(a, b) {
  return b.date.localeCompare(a.date) || createdAtOf(b) - createdAtOf(a);
}
