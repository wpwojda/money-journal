import { useMemo } from "react";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { CATEGORY_COLORS } from "../../constants.js";
import { computeCategoryTotals } from "../../lib/format.js";
import { useSettings } from "../../context/SettingsContext.jsx";
import { EmptyChartState } from "./EmptyChartState.jsx";

export function CategoryDonut({ expenses }) {
  const { formatCurrency: fmt } = useSettings();
  const data = useMemo(() => {
    const totals = computeCategoryTotals(expenses);
    return Object.keys(totals)
      .map((cat) => ({ name: cat, value: totals[cat] }))
      .sort((a, b) => b.value - a.value);
  }, [expenses]);

  if (data.length === 0) return <EmptyChartState message="No expenses logged this month yet." />;

  return (
    <ResponsiveContainer width="100%" height={240}>
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={3}>
          {data.map((d, i) => (
            <Cell key={i} fill={CATEGORY_COLORS[d.name] || CATEGORY_COLORS.Other} stroke="none" />
          ))}
        </Pie>
        <Tooltip formatter={(v) => fmt(v)} />
        <Legend
          layout="vertical"
          verticalAlign="middle"
          align="right"
          iconType="circle"
          wrapperStyle={{ fontSize: 12, color: "var(--text-secondary)" }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
