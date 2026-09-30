import { CATEGORY_KEYWORDS } from "../constants.js";

/**
 * Best-effort category guess from free text, used by quick-add and by recurring items.
 * The user's own categories are checked first, by name: "Pets - 12" lands in "Pets".
 */
export function guessCategory(text, customNames = []) {
  const lower = (text || "").toLowerCase();
  const custom = customNames.find((n) => n && lower.includes(n.toLowerCase()));
  if (custom) return custom;
  for (const cat of Object.keys(CATEGORY_KEYWORDS)) {
    if (CATEGORY_KEYWORDS[cat].some((k) => lower.includes(k))) return cat;
  }
  return "Other";
}

/**
 * Parses free-form quick-add text like "Coffee - €3", "Coffee 3", or "Bus ticket - 2.50"
 * into { description, amount }. Returns null when the text doesn't end in a valid amount.
 */
export function parseQuickAdd(raw) {
  const cleaned = raw.replace(/€|\$|£/g, "").trim();
  if (!cleaned) return null;
  const match = cleaned.match(/^(.+?)\s*-?\s*([0-9]+(?:[.,][0-9]{1,2})?)\s*$/);
  if (!match) return null;
  const description = match[1].trim();
  const amount = parseFloat(match[2].replace(",", "."));
  if (!description || isNaN(amount) || amount <= 0) return null;
  return { description, amount };
}
