import { useMemo } from "react";
import { PieChart, Pie, Cell, Tooltip } from "recharts";
import { computeCategoryTotals } from "../../lib/format.js";
import { useSettings } from "../../context/SettingsContext.jsx";
import { EmptyChartState } from "./EmptyChartState.jsx";

const REMAINING = "Remaining income";

/**
 * Spending by category, shown as a share of the month's income. Whatever income hasn't
 * been spent yet appears as a neutral "Remaining income" slice, with the amount in the
 * centre. The legend is a plain list beside the chart (below it on narrow screens), so
 * long category lists never overlap the ring.
 */
export function CategoryDonut({ expenses, income = 0 }) {
  const { formatCurrency: fmt, categoryColor } = useSettings();

  const { slices, spent, remaining } = useMemo(() => {
    const totals = computeCategoryTotals(expenses);
    const cats = Object.keys(totals)
      .map((cat) => ({ name: cat, value: totals[cat], color: categoryColor(cat) }))
      .sort((a, b) => b.value - a.value);
    const spentTotal = cats.reduce((acc, c) => acc + c.value, 0);
    const left = income - spentTotal;
    const list = left > 0 ? [...cats, { name: REMAINING, value: left, color: "var(--border)", remaining: true }] : cats;
    return { slices: list, spent: spentTotal, remaining: left };
  }, [expenses, income, categoryColor]);

  if (slices.length === 0) return <EmptyChartState message="No income or expenses logged this month yet." />;

  // Percentages are of income when there is some, otherwise of total spending.
  const base = income > 0 ? Math.max(income, spent) : spent;
  const pct = (v) => {
    if (base <= 0) return "0%";
    const p = (v / base) * 100;
    return p > 0 && p < 1 ? "<1%" : `${Math.round(p)}%`;
  };

  return (
    <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-8">
      <div className="relative shrink-0" style={{ width: 200, height: 200 }}>
        <PieChart width={200} height={200}>
          <Pie
            data={slices}
            dataKey="value"
            nameKey="name"
            innerRadius={66}
            outerRadius={96}
            paddingAngle={slices.length > 1 ? 2 : 0}
            startAngle={90}
            endAngle={-270}
            isAnimationActive={false}
          >
            {slices.map((d) => (
              <Cell key={d.name} fill={d.color} stroke="none" />
            ))}
          </Pie>
          <Tooltip formatter={(v) => fmt(v)} />
        </PieChart>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center px-10">
          {income > 0 ? (
            remaining >= 0 ? (
              <>
                <span className="text-lg font-semibold text-primary-c leading-tight">{fmt(remaining)}</span>
                <span className="text-xs text-muted-c mt-0.5">left of {fmt(income)}</span>
              </>
            ) : (
              <>
                <span className="text-lg font-semibold leading-tight" style={{ color: "#C97B63" }}>
                  {fmt(-remaining)}
                </span>
                <span className="text-xs text-muted-c mt-0.5">over income</span>
              </>
            )
          ) : (
            <>
              <span className="text-lg font-semibold text-primary-c leading-tight">{fmt(spent)}</span>
              <span className="text-xs text-muted-c mt-0.5">spent</span>
            </>
          )}
        </div>
      </div>

      <ul className="flex-1 w-full space-y-1.5 text-sm">
        {slices.map((d) => (
          <li
            key={d.name}
            className={"flex items-center gap-2.5 " + (d.remaining ? "pt-1.5 mt-1.5 border-t border-soft" : "")}
          >
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ backgroundColor: d.color, boxShadow: d.remaining ? "inset 0 0 0 1px var(--text-muted)" : "none" }}
            ></span>
            <span className={"flex-1 truncate " + (d.remaining ? "text-muted-c" : "text-secondary-c")}>{d.name}</span>
            <span className={"font-medium tabular-nums " + (d.remaining ? "text-muted-c" : "text-primary-c")}>
              {fmt(d.value)}
            </span>
            <span className="text-xs text-muted-c tabular-nums w-9 text-right">{pct(d.value)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
