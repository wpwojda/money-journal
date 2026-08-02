import { monthLabel } from "../../lib/dateUtils.js";
import { useSettings } from "../../context/SettingsContext.jsx";
import { IconRepeat } from "../common/Icons.jsx";

export function BudgetDueBanner({ items, cursor, onLogOne, onLogAll }) {
  const { formatCurrency: fmt } = useSettings();
  if (!items || items.length === 0) return null;
  return (
    <div className="card p-4 md:p-5 fade-in" style={{ borderColor: "#D3A85C55" }}>
      <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
        <div className="flex items-center gap-2 text-sm font-medium text-primary-c">
          <IconRepeat size={15} />
          {items.length} planned {items.length === 1 ? "expense" : "expenses"} still due for{" "}
          {monthLabel(cursor.year, cursor.month)}
        </div>
        <button onClick={onLogAll} className="btn-primary text-xs px-3 py-1.5">
          Log all
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {items.map((it) => (
          <button key={it.id} onClick={() => onLogOne(it)} className="chip">
            {it.name} · {fmt(it.remaining)}
          </button>
        ))}
      </div>
    </div>
  );
}
