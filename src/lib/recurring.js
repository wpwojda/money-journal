import { clamp, dateFor, daysInMonth, monthKeyOf, todayISO, addDaysISO, shiftMonth, keyFor } from "./dateUtils.js";
import { occurrenceInMonth } from "./budget.js";
import { allExpenseCategories } from "./categories.js";
import { guessCategory } from "./categorize.js";
import { uid } from "./id.js";

/** Safety cap so a start date typed years in the past can't flood the ledger. */
const MAX_OCCURRENCES_PER_RUN = 400;

export function itemType(item) {
  return item.type === "income" ? "income" : "expense";
}

/** All dates (YYYY-MM-DD) on which a recurring item falls due between `from` and `to`, inclusive. */
export function occurrencesBetween(item, from, to) {
  const out = [];
  if (!from || !to || from > to) return out;

  if (item.recurrence === "onetime") {
    if (item.dueDate && item.dueDate >= from && item.dueDate <= to) out.push(item.dueDate);
    return out;
  }

  if (item.recurrence === "weekly") {
    // Weekly items repeat every 7 days from their start date.
    let d = item.startDate || from;
    while (d < from) d = addDaysISO(d, 7);
    while (d <= to && out.length < MAX_OCCURRENCES_PER_RUN) {
      out.push(d);
      d = addDaysISO(d, 7);
    }
    return out;
  }

  // Monthly and yearly: walk month by month.
  let y = parseInt(from.slice(0, 4), 10);
  let m = parseInt(from.slice(5, 7), 10);
  const endY = parseInt(to.slice(0, 4), 10);
  const endM = parseInt(to.slice(5, 7), 10);
  while ((y < endY || (y === endY && m <= endM)) && out.length < MAX_OCCURRENCES_PER_RUN) {
    let date = null;
    if (item.recurrence === "monthly") {
      date = occurrenceInMonth(item, y, m);
    } else if (item.recurrence === "yearly" && item.dueDate && parseInt(item.dueDate.slice(5, 7), 10) === m) {
      date = dateFor(y, m, clamp(parseInt(item.dueDate.slice(8, 10), 10), 1, daysInMonth(y, m)));
    }
    if (date && date >= from && date <= to) out.push(date);
    m += 1;
    if (m > 12) {
      m = 1;
      y += 1;
    }
  }
  return out;
}

/**
 * Whether an occurrence already has a transaction. Weekly items match on the exact date;
 * everything else allows one entry per month, so logging by hand, editing the due day, or
 * moving a transaction's date never produces a duplicate.
 */
function alreadyLogged(item, date, transactions) {
  return transactions.some((t) => {
    if (t.budgetItemId !== item.id) return false;
    const key = t.occurrence || t.date;
    if (item.recurrence === "weekly") return key === date;
    return monthKeyOf(key) === monthKeyOf(date);
  });
}

/** The month key after the one a date falls in, e.g. "2026-09-26" -> "2026-10". */
export function nextMonthKey(date) {
  const next = shiftMonth(parseInt(date.slice(0, 4), 10), parseInt(date.slice(5, 7), 10), 1);
  return keyFor(next.year, next.month);
}

/** Builds the transaction a recurring item produces for a given date. */
export function transactionForItem(item, date, amount = item.amount, customCategories = []) {
  const base = { id: uid(), amount, date, notes: "", budgetItemId: item.id, occurrence: date };
  if (itemType(item) === "income") {
    const tx = { ...base, source: item.category, description: item.name };
    if (item.countsNextMonth) tx.budgetMonth = nextMonthKey(date);
    return tx;
  }
  // Older items used separate budget categories (Housing, Utilities...); fall back to a
  // guess from the name when the item's category isn't a transaction category.
  const known = allExpenseCategories(customCategories);
  const category = known.includes(item.category)
    ? item.category
    : guessCategory(item.name, customCategories.map((c) => c.name));
  return { ...base, category, description: item.name, paymentMethod: "Card" };
}

/**
 * Creates transactions for every automatic recurring item whose due date has arrived.
 * Returns the updated data, or null when there is nothing to add (so callers can keep the
 * same object and avoid a pointless save).
 */
export function generateDueTransactions(data, today = todayISO()) {
  const newExpenses = [];
  const newIncome = [];

  for (const item of data.budgetItems || []) {
    if (!item.active || !item.autoLog || !item.startDate) continue;
    const isIncome = itemType(item) === "income";
    const existing = isIncome ? [...data.income, ...newIncome] : [...data.expenses, ...newExpenses];
    const skipped = item.skipped || [];

    for (const date of occurrencesBetween(item, item.startDate, today)) {
      if (skipped.includes(date)) continue;
      if (alreadyLogged(item, date, existing)) continue;
      const tx = transactionForItem(item, date, item.amount, data.customCategories || []);
      (isIncome ? newIncome : newExpenses).push(tx);
      existing.push(tx);
    }
  }

  if (newExpenses.length === 0 && newIncome.length === 0) return null;
  return {
    ...data,
    expenses: newExpenses.length ? [...data.expenses, ...newExpenses] : data.expenses,
    income: newIncome.length ? [...data.income, ...newIncome] : data.income,
  };
}
