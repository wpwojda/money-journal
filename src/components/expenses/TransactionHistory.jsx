import { useMemo, useState } from "react";
import { formatDayLabel, monthKeyOf } from "../../lib/dateUtils.js";
import { MONTH_NAMES } from "../../constants.js";
import { useSettings } from "../../context/SettingsContext.jsx";
import { IconSearch, IconClose, IconRepeat, IconEdit } from "../common/Icons.jsx";
import { CategoryTag } from "../common/CategoryTag.jsx";

function longDayLabel(dateStr) {
  const short = formatDayLabel(dateStr);
  if (short === "Today" || short === "Yesterday") return short;
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function TransactionHistory({ items: monthItems, allItems, monthName, onEdit, onDelete }) {
  const [scope, setScope] = useState("month"); // "month" | "all"
  const items = scope === "all" && allItems ? allItems : monthItems;
  const { formatCurrency: fmt, expenseCategories, categoryColor } = useSettings();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [catFilter, setCatFilter] = useState(new Set());

  const usedCategories = useMemo(() => {
    const s = new Set();
    items.forEach((i) => {
      if (i.type === "expense") s.add(i.category);
    });
    // Known categories in their usual order, then any leftovers (e.g. from an old import).
    const known = expenseCategories.filter((c) => s.has(c));
    return [...known, ...[...s].filter((c) => !known.includes(c))];
  }, [items, expenseCategories]);

  function toggleCat(cat) {
    setCatFilter((prev) => {
      const next = new Set(prev);
      next.has(cat) ? next.delete(cat) : next.add(cat);
      return next;
    });
  }

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter((item) => {
      if (typeFilter !== "all" && item.type !== typeFilter) return false;
      if (item.type === "expense" && catFilter.size > 0 && !catFilter.has(item.category)) return false;
      if (q) {
        const hay = [item.description, item.notes, item.category, item.source].filter(Boolean).join(" ").toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [items, search, typeFilter, catFilter]);

  const groups = useMemo(() => {
    const map = new Map();
    filtered.forEach((item) => {
      if (!map.has(item.date)) map.set(item.date, []);
      map.get(item.date).push(item);
    });
    return Array.from(map.entries()).sort((a, b) => b[0].localeCompare(a[0]));
  }, [filtered]);

  return (
    <div>
      {allItems && (
        <div className="flex gap-1.5 mb-3">
          {[
            ["month", monthName || "This month"],
            ["all", "All time"],
          ].map(([id, label]) => (
            <button
              key={id}
              onClick={() => setScope(id)}
              className={"px-3 py-1 rounded-lg text-xs font-medium " + (scope === id ? "btn-primary" : "btn-ghost")}
            >
              {label}
            </button>
          ))}
        </div>
      )}
      <div className="flex items-center gap-2 mb-3">
        <div className="relative flex-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-c">
            <IconSearch size={14} />
          </span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search transactions"
            className="input-field pl-8 py-2 text-sm"
          />
        </div>
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="input-field w-28 py-2 text-sm">
          <option value="all">All</option>
          <option value="expense">Expense</option>
          <option value="income">Income</option>
        </select>
      </div>
      {typeFilter !== "income" && usedCategories.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {usedCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => toggleCat(cat)}
              className={"chip " + (catFilter.has(cat) ? "selected" : "")}
              style={catFilter.has(cat) ? { backgroundColor: categoryColor(cat), color: "#fff" } : {}}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {groups.length > 0 && search.trim() && (
        <p className="text-xs text-muted-c mb-2 px-1">
          {filtered.length} {filtered.length === 1 ? "match" : "matches"}
        </p>
      )}
      {groups.length === 0 ? (
        <p className="text-sm text-muted-c py-6 text-center">Nothing matches yet.</p>
      ) : (
        <div className="space-y-3 max-h-[40rem] overflow-y-auto pr-1">
          {groups.map(([date, dayItems]) => (
            <div key={date}>
              <div className="text-xs font-medium text-muted-c uppercase tracking-wide mb-1 px-1">
                {scope === "all" ? longDayLabel(date) : formatDayLabel(date)}
              </div>
              <div className="space-y-1">
                {dayItems.map((item) => (
                  <div
                    key={item.id}
                    className="tx-row flex items-center justify-between gap-3 py-2.5 px-3 rounded-xl hover:bg-[var(--surface-muted)] transition-colors cursor-pointer"
                    onClick={() => onEdit(item)}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {item.type === "expense" ? (
                        <CategoryTag category={item.category} />
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-500">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                          {item.source}
                        </span>
                      )}
                      <span className="text-sm text-secondary-c truncate">{item.description || item.notes || ""}</span>
                      {item.type === "income" && item.budgetMonth && item.budgetMonth !== monthKeyOf(item.date) && (
                        <span className="text-xs text-muted-c shrink-0">
                          for {MONTH_NAMES[parseInt(item.budgetMonth.slice(5, 7), 10) - 1].slice(0, 3)}
                        </span>
                      )}
                      {item.budgetItemId && (
                        <span className="text-muted-c shrink-0">
                          <IconRepeat size={11} />
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={"text-sm font-semibold " + (item.type === "expense" ? "text-primary-c" : "text-emerald-500")}>
                        {item.type === "expense" ? "-" : "+"}
                        {fmt(item.amount)}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onEdit(item);
                        }}
                        className="day-delete-btn transition-opacity text-muted-c hover:text-primary-c p-1"
                        aria-label="Edit transaction"
                        title="Edit"
                      >
                        <IconEdit size={12} />
                      </button>
                      <button
                        aria-label="Delete transaction"
                        title="Delete"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(item.type, item.id);
                        }}
                        className="day-delete-btn transition-opacity text-muted-c hover:text-rose-400 p-1"
                      >
                        <IconClose size={12} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
