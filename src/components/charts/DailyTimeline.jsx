import { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { daysInMonth } from "../../lib/dateUtils.js";
import { useSettings } from "../../context/SettingsContext.jsx";
import { EmptyChartState } from "./EmptyChartState.jsx";

export function DailyTimeline({ expenses, year, month }) {
  const { formatCurrency: fmt } = useSettings();
  const data = useMemo(() => {
    const dim = daysInMonth(year, month);
    const totals = Array.from({ length: dim }, (_, i) => ({ day: i + 1, amount: 0 }));
    expenses.forEach((e) => {
      const day = parseInt(e.date.slice(8, 10), 10);
      if (day >= 1 && day <= dim) totals[day - 1].amount += Number(e.amount);
    });
    return totals;
  }, [expenses, year, month]);

  const hasData = data.some((d) => d.amount > 0);
  if (!hasData) return <EmptyChartState message="Your daily spending will show up here." />;

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
        <XAxis dataKey="day" tick={{ fontSize: 10, fill: "var(--text-muted)" }} axisLine={false} tickLine={false} interval={2} />
        <YAxis
          tick={{ fontSize: 11, fill: "var(--text-muted)" }}
          axisLine={false}
          tickLine={false}
          width={50}
          tickFormatter={(v) => (Math.abs(v) >= 1000 ? `${+(v / 1000).toFixed(1)}k` : v)}
        />
        <Tooltip formatter={(v) => fmt(v)} labelFormatter={(d) => `Day ${d}`} />
        <Bar dataKey="amount" fill="#7FA3C4" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
