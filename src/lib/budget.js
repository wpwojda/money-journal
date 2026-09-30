import { clamp, dateFor, daysInMonth, monthKeyOf, keyFor, shiftMonth, todayISO } from "./dateUtils.js";
import { sum } from "./format.js";

/** Whether a budget item applies to the given { year, month } cursor. */
export function isApplicableThisMonth(item, cursor) {
  if (!item.active) return false;
  if (item.recurrence === "monthly" || item.recurrence === "weekly") return true;
  if (item.recurrence === "yearly") {
    return !!item.dueDate && parseInt(item.dueDate.slice(5, 7), 10) === cursor.month;
  }
  if (item.recurrence === "onetime") {
    return !!item.dueDate && monthKeyOf(item.dueDate) === keyFor(cursor.year, cursor.month);
  }
  return false;
}

/**
 * The amount a budget item contributes to the viewed month.
 * Weekly items are deliberately simplified to a flat 4 occurrences per month rather than
 * counting exact weekday occurrences - precise enough for planning, without the extra
 * complexity of a real weekly ledger.
 */
export function plannedAmountForItem(item) {
  return item.recurrence === "weekly" ? item.amount * 4 : item.amount;
}

/** Sum of already-logged expenses linked to this budget item within the viewed month. */
export function paidAmountForItem(item, monthExpenses) {
  return sum(
    monthExpenses.filter((e) => e.budgetItemId === item.id),
    "amount"
  );
}

export const WEEKDAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

/** Whether a monthly item uses the "last <weekday> of the month" rule. */
export function usesLastWeekday(item) {
  return item.recurrence === "monthly" && item.monthlyRule === "lastWeekday";
}

/** The date a monthly/weekly item falls on in a given calendar month. */
export function occurrenceInMonth(item, year, month) {
  const dim = daysInMonth(year, month);
  if (usesLastWeekday(item)) {
    const weekday = typeof item.weekday === "number" ? item.weekday : 5;
    const lastDow = new Date(year, month - 1, dim).getDay();
    return dateFor(year, month, dim - ((lastDow - weekday + 7) % 7));
  }
  return dateFor(year, month, clamp(item.dueDay || 1, 1, dim));
}

/** Short human description of when an item falls due, e.g. "Monthly · last Friday". */
export function describeSchedule(item) {
  if (usesLastWeekday(item)) {
    const weekday = typeof item.weekday === "number" ? item.weekday : 5;
    return `Monthly · last ${WEEKDAY_NAMES[weekday]}`;
  }
  if (item.recurrence === "monthly" && item.dueDay) return `Monthly · day ${item.dueDay}`;
  const labels = { monthly: "Monthly", weekly: "Weekly", yearly: "Yearly", onetime: "One-time" };
  return labels[item.recurrence] || "Monthly";
}

export function dueDayOfItem(item) {
  if (item.recurrence === "onetime" || item.recurrence === "yearly") {
    return item.dueDate ? parseInt(item.dueDate.slice(8, 10), 10) : null;
  }
  return item.dueDay || null;
}

/**
 * The concrete date to use when logging this item for the viewed month. Income that
 * "counts towards next month" is paid in the month before the one it belongs to.
 */
export function dueDateForItemInMonth(item, cursor) {
  if (item.recurrence === "onetime") return item.dueDate;
  if (item.recurrence === "monthly") {
    const c = item.countsNextMonth ? shiftMonth(cursor.year, cursor.month, -1) : cursor;
    return occurrenceInMonth(item, c.year, c.month);
  }
  const dim = daysInMonth(cursor.year, cursor.month);
  const day = clamp(dueDayOfItem(item) || 1, 1, dim);
  return dateFor(cursor.year, cursor.month, day);
}

export function statusForItem(item, planned, paid, cursor) {
  if (planned > 0 && paid >= planned) return "Completed";
  if (paid > 0) return "Partial";
  const today = new Date();
  const isCurrent = today.getFullYear() === cursor.year && today.getMonth() + 1 === cursor.month;
  const hasFixedDate = usesLastWeekday(item) || dueDayOfItem(item);
  if (isCurrent && hasFixedDate && dueDateForItemInMonth(item, cursor) < todayISO()) return "Overdue";
  return "Upcoming";
}
