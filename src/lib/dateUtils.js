import { MONTH_NAMES } from "../constants.js";

export function pad2(n) {
  return String(n).padStart(2, "0");
}

export function clamp(n, min, max) {
  return Math.min(Math.max(n, min), max);
}

export function todayISO() {
  const d = new Date();
  return d.toISOString().slice(0, 10);
}

export function dateFor(year, month, day) {
  return `${year}-${pad2(month)}-${pad2(day)}`;
}

export function monthKeyOf(dateStr) {
  return dateStr.slice(0, 7);
}

export function daysInMonth(year, month) {
  return new Date(year, month, 0).getDate();
}

export function weekdayOf(dateStr) {
  return new Date(dateStr + "T00:00:00").getDay();
}

export function isWeekend(dateStr) {
  const d = weekdayOf(dateStr);
  return d === 0 || d === 6;
}

export function shiftMonth(year, month, delta) {
  const d = new Date(year, month - 1 + delta, 1);
  return { year: d.getFullYear(), month: d.getMonth() + 1 };
}

export function monthLabel(year, month) {
  return `${MONTH_NAMES[month - 1]} ${year}`;
}

export function keyFor(year, month) {
  return `${year}-${pad2(month)}`;
}

export function formatDayLabel(dateStr) {
  const today = todayISO();
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  if (dateStr === today) return "Today";
  if (dateStr === yesterday) return "Yesterday";
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });
}
