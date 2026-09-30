import { useMemo } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { MONTH_NAMES } from "../../constants.js";
import { shiftMonth, keyFor, monthKeyOf } from "../../lib/dateUtils.js";
import { sum } from "../../lib/format.js";
import { useSettings } from "../../context/SettingsContext.jsx";
import { EmptyChartState } from "./EmptyChartState.jsx";

export function TrendChart({ allExpenses, year, month }) {
  const { formatCurrency: fmt } = useSettings();
  const data = useMemo(() => {
    const months = [];
    for (let i = 5; i >= 0; i--) months.push(shiftMonth(year, month, -i));
    return months.map(({ year: y, month: m }) => {
      const k = keyFor(y, m);
      const expTotal = sum(
        allExpenses.filter((e) => monthKeyOf(e.date) === k),
        "amount"
      );
      return { name: MONTH_NAMES[m - 1].slice(0, 3), expenses: expTotal };
    });
  }, [allExpenses, year, month]);

  const hasData = data.some((d) => d.expenses > 0);
  if (!hasData) return <EmptyChartState message="Log a few months of expenses to see your trend." />;

  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
        <XAxis dataKey="name" tick={{ fontSize: 12, fill: "var(--text-muted)" }} axisLine={false} tickLine={false} />
        <YAxis
          tick={{ fontSize: 11, fill: "var(--text-muted)" }}
          axisLine={false}
          tickLine={false}
          width={50}
          tickFormatter={(v) => (Math.abs(v) >= 1000 ? `${+(v / 1000).toFixed(1)}k` : v)}
        />
        <Tooltip formatter={(v) => fmt(v)} />
        <Line type="monotone" dataKey="expenses" stroke="#E39C8F" strokeWidth={2.5} dot={{ r: 3, fill: "#E39C8F" }} name="Expenses" />
      </LineChart>
    </ResponsiveContainer>
  );
}
