import { useSettings } from "../../context/SettingsContext.jsx";

export function DashboardCards({
  balance,
  income,
  actualExpenses,
  plannedRemaining,
  remainingBudget,
  expectedBalance,
  perDay,
}) {
  const { formatCurrency: fmt } = useSettings();
  const cards = [
    { label: "Current Balance", value: fmt(balance), accent: "#5B8C7B" },
    { label: "Monthly Income", value: fmt(income), accent: "#7FA3C4" },
    { label: "Actual Expenses", value: fmt(actualExpenses), accent: "#E39C8F" },
    { label: "Planned Expenses", value: fmt(plannedRemaining), accent: "#D3A85C" },
    { label: "Remaining Budget", value: fmt(remainingBudget), accent: remainingBudget >= 0 ? "#6FA98A" : "#C97B63" },
    { label: "Expected Balance", value: fmt(expectedBalance), accent: expectedBalance >= 0 ? "#6FA98A" : "#C97B63" },
    { label: "Available to Spend", value: `${fmt(perDay)}/day`, accent: perDay >= 0 ? "#5B8C7B" : "#C97B63" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
      {cards.map((c, i) => (
        <div key={i} className="card card-hover p-4 md:p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-muted-c uppercase tracking-wide">{c.label}</span>
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: c.accent }}></span>
          </div>
          <div className="text-xl md:text-2xl font-semibold text-primary-c">{c.value}</div>
        </div>
      ))}
    </div>
  );
}
