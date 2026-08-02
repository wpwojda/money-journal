import { useMemo, useState } from "react";
import { EXPENSE_CATEGORIES, CATEGORY_COLORS } from "../../constants.js";
import { formatDayLabel } from "../../lib/dateUtils.js";
import { useSettings } from "../../context/SettingsContext.jsx";
import { IconSearch, IconClose, IconRepeat } from "../common/Icons.jsx";
import { CategoryTag } from "../common/CategoryTag.jsx";

export function TransactionHistory({ items, onEdit, onDelete }) {
  const { formatCurrency: fmt } = useSettings();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [catFilter, setCatFilter] = useState(new Set());

  const usedCategories = useMemo(() => {
    const s = new Set();
    items.forEach((i) => {
      if (i.type === "expense") s.add(i.category);
    });
    return EXPENSE_CATEGORIES.filter((c) => s.has(c));
  }, [items]);

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
              style={catFilter.has(cat) ? { backgroundColor: CATEGORY_COLORS[cat], color: "#fff" } : {}}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {groups.length === 0 ? (
        <p className="text-sm text-muted-c py-6 text-center">Nothing matches yet.</p>
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
          {groups.map(([date, dayItems]) => (
            <div key={date}>
              <div className="text-xs font-medium text-muted-c uppercase tracking-wide mb-1 px-1">
                {formatDayLabel(date)}
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
                      {item.type === "expense" && item.budgetItemId && (
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
