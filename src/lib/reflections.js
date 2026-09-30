import { daysInMonth, isWeekend } from "./dateUtils.js";
import { sum, computeCategoryTotals } from "./format.js";

/**
 * Rule-based "money reflection" messages - no external AI, just simple heuristics over
 * the current data. Every candidate is scored and only the top few are shown, so the
 * message set adapts to whatever is most relevant that month instead of a fixed list.
 */
export function generateReflections({
  monthExpenses,
  monthIncome,
  prevMonthExpenses,
  allTimeBalance,
  cursor,
  plannedRemaining,
  totalPlannedBudgeted,
  applicableCount,
  formatCurrency: fmt,
}) {
  const candidates = [];
  const totalExpenses = sum(monthExpenses, "amount");
  const totalIncome = sum(monthIncome, "amount");
  const saved = totalIncome - totalExpenses;

  if (totalIncome === 0 && totalExpenses === 0 && applicableCount === 0) {
    return ["Add today's expenses or this month's income to start seeing your money story."];
  }

  if (totalIncome > 0) {
    if (saved > 0) candidates.push({ score: 10, text: `You saved ${fmt(saved)} this month. Nice work.` });
    else if (saved < 0)
      candidates.push({ score: 10, text: `You spent ${fmt(Math.abs(saved))} more than you earned this month.` });
    else candidates.push({ score: 10, text: `You broke even this month, income matched spending exactly.` });
  }

  if (totalPlannedBudgeted > 0) {
    if (plannedRemaining > 0) {
      candidates.push({ score: 9, text: `You still have ${fmt(plannedRemaining)} in upcoming bills this month.` });
    } else {
      candidates.push({ score: 6.5, text: `All your planned bills are paid for this month.` });
    }
  }

  const catTotals = computeCategoryTotals(monthExpenses);
  const topCat = Object.keys(catTotals).sort((a, b) => catTotals[b] - catTotals[a])[0];
  if (topCat) {
    candidates.push({ score: 5, text: `Your biggest expense category is ${topCat}, at ${fmt(catTotals[topCat])}.` });
  }

  if (prevMonthExpenses && prevMonthExpenses.length > 0) {
    const prevTotals = computeCategoryTotals(prevMonthExpenses);
    let bestCat = null;
    let bestPct = 0;
    Object.keys(catTotals).forEach((cat) => {
      const prev = prevTotals[cat] || 0;
      if (prev > 5) {
        const pct = ((catTotals[cat] - prev) / prev) * 100;
        if (Math.abs(pct) > Math.abs(bestPct)) {
          bestPct = pct;
          bestCat = cat;
        }
      }
    });
    if (bestCat && Math.abs(bestPct) >= 10) {
      candidates.push({
        score: 6,
        text: `You spent ${Math.abs(bestPct).toFixed(0)}% ${bestPct < 0 ? "less" : "more"} on ${bestCat} compared to last month.`,
      });
    }
  }

  if (monthExpenses.length >= 5) {
    const dim = daysInMonth(cursor.year, cursor.month);
    const today = new Date();
    const isCurrent = today.getFullYear() === cursor.year && today.getMonth() + 1 === cursor.month;
    const elapsedDays = isCurrent ? today.getDate() : dim;
    const avgDaily = totalExpenses / Math.max(elapsedDays, 1);
    candidates.push({ score: 4, text: `Your average daily spend this month is ${fmt(avgDaily)}.` });

    const weekendTotal = sum(
      monthExpenses.filter((e) => isWeekend(e.date)),
      "amount"
    );
    const weekdayTotal = totalExpenses - weekendTotal;
    const weekendDays = new Set(monthExpenses.filter((e) => isWeekend(e.date)).map((e) => e.date)).size || 1;
    const weekdayDays = new Set(monthExpenses.filter((e) => !isWeekend(e.date)).map((e) => e.date)).size || 1;
    const weekendAvg = weekendTotal / weekendDays;
    const weekdayAvg = weekdayTotal / weekdayDays;
    if (weekendTotal > 0 && weekdayTotal > 0) {
      if (weekendAvg > weekdayAvg * 1.15) {
        candidates.push({
          score: 4.5,
          text: `You tend to spend more on weekends, ${fmt(weekendAvg)}/day versus ${fmt(weekdayAvg)}/day on weekdays.`,
        });
      } else if (weekdayAvg > weekendAvg * 1.15) {
        candidates.push({
          score: 4.5,
          text: `Your weekday spending runs higher than weekends, ${fmt(weekdayAvg)}/day versus ${fmt(weekendAvg)}/day.`,
        });
      }
    }

    const dayTotals = {};
    monthExpenses.forEach((e) => {
      dayTotals[e.date] = (dayTotals[e.date] || 0) + Number(e.amount);
    });
    const aboveAvgDays = Object.values(dayTotals).filter((v) => v > avgDaily * 1.5).length;
    if (aboveAvgDays >= 3) {
      candidates.push({ score: 3, text: `${aboveAvgDays} days this month were well above your usual daily spend.` });
    }

    if (allTimeBalance > 0 && avgDaily > 0) {
      const runwayDays = Math.round(allTimeBalance / avgDaily);
      if (runwayDays < 120) {
        candidates.push({
          score: 4,
          text: `At your current spending rate, what's left this month covers roughly ${runwayDays} days.`,
        });
      }
    }
  }

  return candidates
    .sort((a, b) => b.score - a.score)
    .slice(0, 4)
    .map((c) => c.text);
}
