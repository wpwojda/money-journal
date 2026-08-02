import { useSettings } from "../../context/SettingsContext.jsx";

export function MonthlyFinancialSummary({
  totalIncome,
  totalFixed,
  totalVariable,
  remainingBudget,
  savings,
  utilizationPct,
  largestExpense,
  largestBudgetCategory,
}) {
  const { formatCurrency: fmt } = useSettings();
  const stats = [
    { label: "Total income", value: fmt(totalIncome) },
    { label: "Fixed expenses", value: fmt(totalFixed) },
    { label: "Variable expenses", value: fmt(totalVariable) },
    { label: "Remaining budget", value: fmt(remainingBudget) },
    { label: "Savings", value: fmt(savings) },
    { label: "Budget utilization", value: utilizationPct === null ? "—" : `${utilizationPct.toFixed(0)}%` },
    {
      label: "Largest expense",
      value: largestExpense ? `${largestExpense.description || largestExpense.category} · ${fmt(largestExpense.amount)}` : "—",
    },
    {
      label: "Largest budget category",
      value: largestBudgetCategory ? `${largestBudgetCategory[0]} · ${fmt(largestBudgetCategory[1])}` : "—",
    },
  ];

  return (
    <div className="card p-5">
      <h3 className="text-sm font-semibold text-secondary-c uppercase tracking-wide mb-3">Monthly financial summary</h3>
      <div className="grid grid-cols-2 gap-3">
        {stats.map((s, i) => (
          <div key={i} className="surface-muted rounded-xl p-3.5">
            <div className="text-xs text-muted-c mb-1">{s.label}</div>
            <div className="text-sm font-semibold text-primary-c truncate">{s.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
