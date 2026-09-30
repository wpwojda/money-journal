import { EXPENSE_CATEGORIES, CATEGORY_COLORS, INCOME_SOURCES } from "../constants.js";

/** Colours handed out to custom categories, in order. */
export const CUSTOM_CATEGORY_PALETTE = [
  "#6C9BD2",
  "#C98BB9",
  "#8FB573",
  "#D98F5C",
  "#5FB3B3",
  "#B5A36A",
  "#9C8FD6",
  "#D4757C",
];

/** Built-in categories plus the user's own, with "Other" kept last. */
export function allExpenseCategories(custom = []) {
  const builtIn = EXPENSE_CATEGORIES.filter((c) => c !== "Other");
  return [...builtIn, ...custom.map((c) => c.name), "Other"];
}

export function allIncomeSources(custom = []) {
  const builtIn = INCOME_SOURCES.filter((s) => s !== "Other");
  return [...builtIn, ...custom, "Other"];
}

export function categoryColor(name, custom = []) {
  if (CATEGORY_COLORS[name]) return CATEGORY_COLORS[name];
  const found = custom.find((c) => c.name === name);
  return found ? found.color : CATEGORY_COLORS.Other;
}

export function isBuiltInCategory(name) {
  return EXPENSE_CATEGORIES.some((c) => c.toLowerCase() === name.toLowerCase());
}

export function isBuiltInIncomeSource(name) {
  return INCOME_SOURCES.some((s) => s.toLowerCase() === name.toLowerCase());
}
