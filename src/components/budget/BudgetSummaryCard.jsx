import { useSettings } from "../../context/SettingsContext.jsx";
import { IconWallet } from "../common/Icons.jsx";
import { StatusPill } from "../common/StatusPill.jsx";

export function BudgetSummaryCard({ computedItems, totalPlanned, totalRemaining, onOpenBudget }) {
  const { formatCurrency: fmt } = useSettings();

  if (computedItems.length === 0) {
    return (
      <div className="card p-5">
        <h3 className="text-sm font-semibold text-secondary-c uppercase tracking-wide mb-2">Budget</h3>
        <p className="text-sm text-muted-c mb-3">
          Add recurring bills like rent or subscriptions to see them here automatically each month.
        </p>
        <button onClick={onOpenBudget} className="btn-ghost text-sm px-3 py-2">
          Set up budget
        </button>
      </div>
    );
  }

  const pct = totalPlanned > 0 ? Math.min(((totalPlanned - totalRemaining) / totalPlanned) * 100, 100) : 0;

  return (
    <div className="card p-5 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-secondary-c uppercase tracking-wide">Budget</h3>
        <button onClick={onOpenBudget} className="text-xs font-medium text-muted-c hover:text-primary-c flex items-center gap-1">
          <IconWallet size={13} /> Manage
        </button>
      </div>
      <div>
        <div className="flex items-center justify-between text-xs mb-1">
          <span className="text-secondary-c font-medium">Paid vs planned</span>
          <span className="text-muted-c">
            {fmt(totalPlanned - totalRemaining)} / {fmt(totalPlanned)}
          </span>
        </div>
        <div className="w-full h-2 rounded-full overflow-hidden surface-muted">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${pct}%`, backgroundColor: "#6FA98A" }}
          ></div>
        </div>
      </div>
      <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
        {computedItems.slice(0, 6).map((it) => (
          <div key={it.id} className="flex items-center justify-between text-sm">
            <span className="text-secondary-c truncate pr-2">{it.name}</span>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-primary-c font-medium">{fmt(it.planned)}</span>
              <StatusPill status={it.status} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
