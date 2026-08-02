import { clamp, dateFor, daysInMonth, monthKeyOf, keyFor } from "./dateUtils.js";
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

export function dueDayOfItem(item) {
  if (item.recurrence === "onetime" || item.recurrence === "yearly") {
    return item.dueDate ? parseInt(item.dueDate.slice(8, 10), 10) : null;
  }
  return item.dueDay || null;
}

/** The concrete date to use when logging this item as paid in the viewed month. */
export function dueDateForItemInMonth(item, cursor) {
  if (item.recurrence === "onetime") return item.dueDate;
  const dim = daysInMonth(cursor.year, cursor.month);
  const day = clamp(dueDayOfItem(item) || 1, 1, dim);
  return dateFor(cursor.year, cursor.month, day);
}

export function statusForItem(item, planned, paid, cursor) {
  if (planned > 0 && paid >= planned) return "Completed";
  if (paid > 0) return "Partial";
  const today = new Date();
  const isCurrent = today.getFullYear() === cursor.year && today.getMonth() + 1 === cursor.month;
  if (isCurrent) {
    const dueDay = dueDayOfItem(item);
    if (dueDay && today.getDate() > dueDay) return "Overdue";
  }
  return "Upcoming";
}
