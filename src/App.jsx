import { useEffect, useMemo, useRef, useState } from "react";
import { SettingsContext } from "./context/SettingsContext.jsx";
import {
  loadData,
  saveData,
  defaultData,
  normalizeData,
  subscribeToDataChanges,
  SAVE_OK,
  SAVE_QUOTA_EXCEEDED,
} from "./lib/storage.js";
import { formatCurrency, sum } from "./lib/format.js";
import { applyTheme } from "./lib/theme.js";
import { newestFirst } from "./lib/id.js";
import {
  shiftMonth,
  keyFor,
  monthKeyOf,
  monthLabel,
  daysInMonth,
} from "./lib/dateUtils.js";
import {
  isApplicableThisMonth,
  plannedAmountForItem,
  paidAmountForItem,
  statusForItem,
  dueDateForItemInMonth,
} from "./lib/budget.js";
import { generateReflections } from "./lib/reflections.js";
import { generateDueTransactions, transactionForItem, itemType } from "./lib/recurring.js";
import {
  allExpenseCategories,
  allIncomeSources,
  categoryColor,
  isBuiltInCategory,
  isBuiltInIncomeSource,
  CUSTOM_CATEGORY_PALETTE,
} from "./lib/categories.js";

import { IconPlus, IconSettings, IconChevron, IconRepeat, IconClose } from "./components/common/Icons.jsx";
import { Modal } from "./components/common/Modal.jsx";
import { DashboardCards } from "./components/dashboard/DashboardCards.jsx";
import { MoneyReflection } from "./components/dashboard/MoneyReflection.jsx";
import { MonthlyFinancialSummary } from "./components/dashboard/MonthlyFinancialSummary.jsx";
import { CategoryDonut } from "./components/charts/CategoryDonut.jsx";
import { TrendChart } from "./components/charts/TrendChart.jsx";
import { DailyTimeline } from "./components/charts/DailyTimeline.jsx";
import { ExpenseForm } from "./components/expenses/ExpenseForm.jsx";
import { IncomeForm } from "./components/expenses/IncomeForm.jsx";
import { TransactionHistory } from "./components/expenses/TransactionHistory.jsx";
import { UndoToast } from "./components/UndoToast.jsx";
import { BudgetDueBanner } from "./components/budget/BudgetDueBanner.jsx";
import { BudgetSummaryCard } from "./components/budget/BudgetSummaryCard.jsx";
import { BudgetModal } from "./components/budget/BudgetModal.jsx";
import { SettingsModal } from "./components/settings/SettingsModal.jsx";
import { AboutModal } from "./components/AboutModal.jsx";

export default function App() {
  const initialLoad = useState(loadData)[0];
  const [data, setData] = useState(initialLoad.data);
  const [showCorruptedNotice, setShowCorruptedNotice] = useState(initialLoad.corrupted);
  const [showRecoveredNotice, setShowRecoveredNotice] = useState(initialLoad.recoveredFromBackup);
  const [saveError, setSaveError] = useState(initialLoad.storageAvailable === false ? "unavailable" : null);
  const [cursor, setCursor] = useState(() => {
    const d = new Date();
    return { year: d.getFullYear(), month: d.getMonth() + 1 };
  });
  const [modal, setModal] = useState(null); // "income" | "expense" | "settings" | "budget" | "about" | null
  const [editing, setEditing] = useState(null); // { type, item } | null
  const [pendingDelete, setPendingDelete] = useState(null);
  const pendingTimeoutRef = useRef(null);

  // Persist on every change, and surface failures. Silently dropping a write would mean
  // the user believes their finances are saved when they are not.
  useEffect(() => {
    const result = saveData(data);
    setSaveError(result === SAVE_OK ? null : result);
  }, [data]);

  // Adopt writes made in other tabs of this browser. Every tab holds its own copy of the
  // whole record, so without this the last tab to save would silently overwrite the rest.
  // saveData no-ops when the value is unchanged, so adopting an update never echoes back.
  useEffect(() => subscribeToDataChanges(setData), []);

  // Automatic recurring items: log anything that has fallen due. Runs on load, whenever
  // the recurring list changes, and when the tab comes back into view (so a phone that
  // left the app open overnight still picks up today's items).
  useEffect(() => {
    const run = () => setData((d) => generateDueTransactions(d) || d);
    run();
    const onVisible = () => {
      if (document.visibilityState === "visible") run();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [data.budgetItems]);
  useEffect(() => {
    applyTheme(data.settings.theme);
  }, [data.settings.theme]);
  useEffect(() => {
    if (data.settings.theme !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => applyTheme("system");
    mq.addEventListener ? mq.addEventListener("change", handler) : mq.addListener(handler);
    return () => {
      mq.removeEventListener ? mq.removeEventListener("change", handler) : mq.removeListener(handler);
    };
  }, [data.settings.theme]);

  const effectiveExpenses = useMemo(
    () => (pendingDelete && pendingDelete.type === "expense" ? data.expenses.filter((e) => e.id !== pendingDelete.id) : data.expenses),
    [data.expenses, pendingDelete]
  );
  const effectiveIncome = useMemo(
    () => (pendingDelete && pendingDelete.type === "income" ? data.income.filter((i) => i.id !== pendingDelete.id) : data.income),
    [data.income, pendingDelete]
  );

  const monthKey = keyFor(cursor.year, cursor.month);
  const prevCursor = shiftMonth(cursor.year, cursor.month, -1);
  const prevMonthKey = keyFor(prevCursor.year, prevCursor.month);
  // Allow viewing one month ahead: income that "counts towards next month" lives there.
  const canGoForward = (() => {
    const d = new Date();
    const limit = shiftMonth(d.getFullYear(), d.getMonth() + 1, 1);
    return cursor.year < limit.year || (cursor.year === limit.year && cursor.month < limit.month);
  })();
  const isCurrentMonth = (() => {
    const d = new Date();
    return d.getFullYear() === cursor.year && d.getMonth() + 1 === cursor.month;
  })();

  const monthExpenses = useMemo(
    () => effectiveExpenses.filter((e) => monthKeyOf(e.date) === monthKey).sort(newestFirst),
    [effectiveExpenses, monthKey]
  );
  const monthIncome = useMemo(
    // Income can be marked as belonging to a different month than the day it arrived
    // (e.g. salary paid late in September for October), via budgetMonth.
    () =>
      effectiveIncome
        .filter((i) => (i.budgetMonth || monthKeyOf(i.date)) === monthKey)
        .sort(newestFirst),
    [effectiveIncome, monthKey]
  );
  const prevMonthExpenses = useMemo(
    () => effectiveExpenses.filter((e) => monthKeyOf(e.date) === prevMonthKey),
    [effectiveExpenses, prevMonthKey]
  );

  const totalIncomeMonth = sum(monthIncome, "amount");
  const totalExpensesMonth = sum(monthExpenses, "amount");
  // Balances are per month: what came in for this month minus what has gone out.
  const monthBalance = totalIncomeMonth - totalExpensesMonth;

  // Recurring items applicable to the viewed month, with planned/paid/status computed.
  const recurringComputed = useMemo(() => {
    return (data.budgetItems || [])
      .filter((it) => isApplicableThisMonth(it, cursor))
      .sort((a, b) => a.order - b.order)
      .map((it) => {
        const planned = plannedAmountForItem(it);
        const paid = paidAmountForItem(it, itemType(it) === "income" ? monthIncome : monthExpenses);
        const status = statusForItem(it, planned, paid, cursor);
        return { ...it, planned, paid, status, remaining: Math.max(planned - paid, 0) };
      });
  }, [data.budgetItems, cursor, monthExpenses, monthIncome]);
  const budgetItemsComputed = useMemo(() => recurringComputed.filter((it) => itemType(it) === "expense"), [recurringComputed]);
  const upcomingIncome = recurringComputed
    .filter((it) => itemType(it) === "income")
    .reduce((acc, it) => acc + it.remaining, 0);

  const totalPlannedBudgeted = sum(budgetItemsComputed, "planned");
  const totalPlannedPaidCapped = budgetItemsComputed.reduce((acc, b) => acc + Math.min(b.paid, b.planned), 0);
  const totalPlannedRemaining = sum(budgetItemsComputed, "remaining");

  const fixedExpenses = useMemo(() => monthExpenses.filter((e) => e.budgetItemId), [monthExpenses]);
  const variableExpenses = useMemo(() => monthExpenses.filter((e) => !e.budgetItemId), [monthExpenses]);
  const totalFixed = sum(fixedExpenses, "amount");
  const totalVariable = sum(variableExpenses, "amount");

  const remainingBudget = totalIncomeMonth + upcomingIncome - totalExpensesMonth - totalPlannedRemaining;
  const daysLeft = isCurrentMonth
    ? Math.max(daysInMonth(cursor.year, cursor.month) - new Date().getDate() + 1, 1)
    : daysInMonth(cursor.year, cursor.month);
  const availablePerDay = remainingBudget / daysLeft;

  const savingsMonth = totalIncomeMonth - totalExpensesMonth;
  const budgetUtilizationPct = totalPlannedBudgeted > 0 ? (totalPlannedPaidCapped / totalPlannedBudgeted) * 100 : null;
  const largestExpense = monthExpenses.slice().sort((a, b) => b.amount - a.amount)[0] || null;
  const largestBudgetCategory = useMemo(() => {
    const map = {};
    budgetItemsComputed.forEach((b) => {
      map[b.category] = (map[b.category] || 0) + b.planned;
    });
    const entries = Object.entries(map).sort((a, b) => b[1] - a[1]);
    return entries[0] || null;
  }, [budgetItemsComputed]);


  const fmt = (n) => formatCurrency(n, data.settings.currency);

  const reflections = useMemo(
    () =>
      generateReflections({
        monthExpenses,
        monthIncome,
        prevMonthExpenses,
        allTimeBalance: monthBalance,
        cursor,
        plannedRemaining: totalPlannedRemaining,
        totalPlannedBudgeted,
        applicableCount: budgetItemsComputed.length,
        formatCurrency: fmt,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [monthExpenses, monthIncome, prevMonthExpenses, monthBalance, cursor, totalPlannedRemaining, totalPlannedBudgeted, budgetItemsComputed.length, data.settings.currency]
  );

  const allTransactions = useMemo(() => {
    const exp = effectiveExpenses.map((e) => ({ ...e, type: "expense" }));
    const inc = effectiveIncome.map((i) => ({ ...i, type: "income" }));
    return [...exp, ...inc].sort(newestFirst);
  }, [effectiveExpenses, effectiveIncome]);

  const transactions = useMemo(() => {
    const exp = monthExpenses.map((e) => ({ ...e, type: "expense" }));
    const inc = monthIncome.map((i) => ({ ...i, type: "income" }));
    return [...exp, ...inc].sort(newestFirst);
  }, [monthExpenses, monthIncome]);

  // Automatic items log themselves, so only manual ones need a nudge.
  const unpaidBudgetItems = useMemo(
    () => recurringComputed.filter((b) => b.remaining > 0 && !b.autoLog),
    [recurringComputed]
  );

  function addExpense(entry) {
    setData((d) => ({ ...d, expenses: [...d.expenses, entry] }));
  }
  function addIncome(entry) {
    setData((d) => ({ ...d, income: [...d.income, entry] }));
  }
  function updateExpense(entry) {
    setData((d) => ({ ...d, expenses: d.expenses.map((e) => (e.id === entry.id ? entry : e)) }));
  }
  function updateIncome(entry) {
    setData((d) => ({ ...d, income: d.income.map((i) => (i.id === entry.id ? entry : i)) }));
  }

  function finalizeDelete(pd) {
    setData((d) => {
      const key = pd.type === "expense" ? "expenses" : "income";
      const next = { ...d, [key]: d[key].filter((x) => x.id !== pd.id) };
      // Deleting one occurrence of a recurring item means "skip this one" - remember it
      // so the automatic logger doesn't put it straight back.
      const { budgetItemId, occurrence } = pd.item || {};
      if (budgetItemId && occurrence) {
        next.budgetItems = (d.budgetItems || []).map((b) =>
          b.id === budgetItemId && !(b.skipped || []).includes(occurrence)
            ? { ...b, skipped: [...(b.skipped || []), occurrence] }
            : b
        );
      }
      return next;
    });
  }

  function requestDelete(type, id) {
    if (pendingDelete && pendingTimeoutRef.current) {
      clearTimeout(pendingTimeoutRef.current);
      finalizeDelete(pendingDelete);
    }
    const item = (type === "expense" ? data.expenses : data.income).find((x) => x.id === id);
    if (!item) return;
    const pd = { type, id, item };
    pendingTimeoutRef.current = setTimeout(() => {
      finalizeDelete(pd);
      setPendingDelete((curr) => (curr && curr.id === pd.id ? null : curr));
    }, 5000);
    setPendingDelete(pd);
  }

  function undoDelete() {
    if (pendingTimeoutRef.current) clearTimeout(pendingTimeoutRef.current);
    setPendingDelete(null);
  }

  function logBudgetItem(item) {
    const computed = recurringComputed.find((b) => b.id === item.id) || item;
    const amt = computed.remaining > 0 ? computed.remaining : computed.planned || item.amount;
    const tx = transactionForItem(item, dueDateForItemInMonth(item, cursor), amt, data.customCategories || []);
    if (itemType(item) === "income") addIncome(tx);
    else addExpense(tx);
  }
  function logAllBudgetItems() {
    unpaidBudgetItems.forEach(logBudgetItem);
  }

  function addBudgetItem(item) {
    setData((d) => ({ ...d, budgetItems: [...(d.budgetItems || []), item] }));
  }
  function updateBudgetItem(item) {
    setData((d) => ({ ...d, budgetItems: (d.budgetItems || []).map((b) => (b.id === item.id ? item : b)) }));
  }
  /** Deletes a recurring item, optionally along with every transaction it logged. */
  function deleteBudgetItem(id, removeEntries = false) {
    setData((d) => ({
      ...d,
      budgetItems: (d.budgetItems || []).filter((b) => b.id !== id),
      expenses: removeEntries ? d.expenses.filter((e) => e.budgetItemId !== id) : d.expenses,
      income: removeEntries ? d.income.filter((i) => i.budgetItemId !== id) : d.income,
    }));
  }
  /** Every transaction a recurring item has logged, across all months. */
  function entriesForItem(id) {
    return [...data.expenses, ...data.income].filter((t) => t.budgetItemId === id);
  }
  function toggleBudgetItemActive(id) {
    setData((d) => ({
      ...d,
      budgetItems: (d.budgetItems || []).map((b) => (b.id === id ? { ...b, active: !b.active } : b)),
    }));
  }
  function reorderBudgetItem(id, direction) {
    setData((d) => {
      const items = d.budgetItems || [];
      const sorted = items.slice().sort((a, b) => a.order - b.order);
      const idx = sorted.findIndex((i) => i.id === id);
      const swapIdx = direction === "up" ? idx - 1 : idx + 1;
      if (idx < 0 || swapIdx < 0 || swapIdx >= sorted.length) return d;
      const a = sorted[idx];
      const b = sorted[swapIdx];
      return {
        ...d,
        budgetItems: items.map((it) => (it.id === a.id ? { ...it, order: b.order } : it.id === b.id ? { ...it, order: a.order } : it)),
      };
    });
  }
  // ---- Custom categories and income sources ----
  const customCategories = useMemo(() => data.customCategories || [], [data.customCategories]);
  const customIncomeSources = useMemo(() => data.customIncomeSources || [], [data.customIncomeSources]);
  const expenseCategories = useMemo(() => allExpenseCategories(customCategories), [customCategories]);
  const incomeSources = useMemo(() => allIncomeSources(customIncomeSources), [customIncomeSources]);

  /** Adds a custom expense category. Returns the canonical name (existing match if any). */
  function addExpenseCategory(rawName) {
    const name = (rawName || "").trim();
    if (!name) return null;
    const existing = expenseCategories.find((c) => c.toLowerCase() === name.toLowerCase());
    if (existing) return existing;
    setData((d) => {
      const list = d.customCategories || [];
      if (isBuiltInCategory(name) || list.some((c) => c.name.toLowerCase() === name.toLowerCase())) return d;
      const color = CUSTOM_CATEGORY_PALETTE[list.length % CUSTOM_CATEGORY_PALETTE.length];
      return { ...d, customCategories: [...list, { name, color }] };
    });
    return name;
  }
  /** Removes a custom category; anything filed under it moves to "Other". */
  function deleteExpenseCategory(name) {
    setData((d) => ({
      ...d,
      customCategories: (d.customCategories || []).filter((c) => c.name !== name),
      expenses: d.expenses.map((e) => (e.category === name ? { ...e, category: "Other" } : e)),
      budgetItems: (d.budgetItems || []).map((b) =>
        itemType(b) === "expense" && b.category === name ? { ...b, category: "Other" } : b
      ),
    }));
  }
  function addIncomeSource(rawName) {
    const name = (rawName || "").trim();
    if (!name) return null;
    const existing = incomeSources.find((c) => c.toLowerCase() === name.toLowerCase());
    if (existing) return existing;
    setData((d) => {
      const list = d.customIncomeSources || [];
      if (isBuiltInIncomeSource(name) || list.some((n) => n.toLowerCase() === name.toLowerCase())) return d;
      return { ...d, customIncomeSources: [...list, name] };
    });
    return name;
  }
  function deleteIncomeSource(name) {
    setData((d) => ({
      ...d,
      customIncomeSources: (d.customIncomeSources || []).filter((n) => n !== name),
      income: d.income.map((i) => (i.source === name ? { ...i, source: "Other" } : i)),
      budgetItems: (d.budgetItems || []).map((b) =>
        itemType(b) === "income" && b.category === name ? { ...b, category: "Other" } : b
      ),
    }));
  }

  function updateSettings(patch) {
    setData((d) => ({ ...d, settings: { ...d.settings, ...patch } }));
  }
  function importAll(parsed) {
    setData(normalizeData(parsed));
  }
  function clearAll() {
    setData(defaultData());
  }

  const settingsCtxValue = useMemo(
    () => ({
      settings: data.settings,
      formatCurrency: fmt,
      updateSettings,
      expenseCategories,
      incomeSources,
      customCategories,
      customIncomeSources,
      categoryColor: (name) => categoryColor(name, customCategories),
      addExpenseCategory,
      addIncomeSource,
      deleteExpenseCategory,
      deleteIncomeSource,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [data.settings, expenseCategories, incomeSources, customCategories, customIncomeSources]
  );

  return (
    <SettingsContext.Provider value={settingsCtxValue}>
      <div className="max-w-5xl mx-auto px-4 md:px-6 py-6 md:py-10 space-y-5 md:space-y-6">
        {saveError && (
          <div className="card p-3.5 flex items-start justify-between text-sm" style={{ borderColor: "#E4867A55" }} role="alert">
            <span className="text-secondary-c">
              {saveError === SAVE_QUOTA_EXCEEDED
                ? "This browser's storage is full, so your latest changes could not be saved. Export a backup from Settings, then clear some space."
                : "Changes can't be saved to this browser right now (storage may be disabled or in private mode). Your data is only held in memory and will be lost when you close this tab - export a backup from Settings to keep it."}
            </span>
          </div>
        )}

        {showRecoveredNotice && (
          <div className="card p-3.5 flex items-center justify-between text-sm fade-in" style={{ borderColor: "#D3A85C55" }}>
            <span className="text-secondary-c">
              Your main saved data was damaged, so we restored the automatic backup. Please check that recent entries
              look right.
            </span>
            <button
              onClick={() => setShowRecoveredNotice(false)}
              className="text-muted-c hover:text-primary-c ml-3"
              aria-label="Dismiss backup recovery notice"
            >
              <IconClose size={14} />
            </button>
          </div>
        )}

        {showCorruptedNotice && (
          <div className="card p-3.5 flex items-center justify-between text-sm fade-in" style={{ borderColor: "#E4867A55" }}>
            <span className="text-secondary-c">
              We couldn&apos;t read your previous data, so we started fresh. If you have a backup JSON, import it from
              Settings.
            </span>
            <button
              onClick={() => setShowCorruptedNotice(false)}
              className="text-muted-c hover:text-primary-c ml-3"
              aria-label="Dismiss data recovery notice"
            >
              <IconClose size={14} />
            </button>
          </div>
        )}

        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-primary-c">Money Journal</h1>
            <p className="text-sm text-muted-c mt-0.5">A quiet place to track what comes in and what goes out.</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 card px-2 py-1.5">
              <button
                onClick={() => setCursor((c) => shiftMonth(c.year, c.month, -1))}
                className="p-1.5 rounded-lg hover:bg-[var(--surface-muted)] text-secondary-c"
              >
                <IconChevron dir="left" />
              </button>
              <span className="text-sm font-medium text-primary-c w-28 text-center select-none">
                {monthLabel(cursor.year, cursor.month)}
              </span>
              <button
                onClick={() => setCursor((c) => shiftMonth(c.year, c.month, 1))}
                disabled={!canGoForward}
                className={"p-1.5 rounded-lg hover:bg-[var(--surface-muted)] text-secondary-c " + (!canGoForward ? "opacity-30 cursor-not-allowed" : "")}
              >
                <IconChevron dir="right" />
              </button>
            </div>
            <button onClick={() => setModal("settings")} className="btn-ghost p-2.5">
              <IconSettings size={18} />
            </button>
          </div>
        </div>

        <DashboardCards
          balance={monthBalance}
          income={totalIncomeMonth}
          actualExpenses={totalExpensesMonth}
          plannedRemaining={totalPlannedRemaining}
          remainingBudget={remainingBudget}
          perDay={availablePerDay}
        />

        {unpaidBudgetItems.length > 0 && (
          <BudgetDueBanner items={unpaidBudgetItems} cursor={cursor} onLogOne={logBudgetItem} onLogAll={logAllBudgetItems} />
        )}

        <div className="grid md:grid-cols-3 gap-5">
          <div className="md:col-span-2 space-y-5">
            <div className="card p-5">
              <h3 className="text-sm font-semibold text-secondary-c uppercase tracking-wide mb-4">Spending by category</h3>
              <CategoryDonut expenses={monthExpenses} income={totalIncomeMonth} />
            </div>
            <div className="card p-5">
              <h3 className="text-sm font-semibold text-secondary-c uppercase tracking-wide mb-2">Daily spending</h3>
              <DailyTimeline expenses={monthExpenses} year={cursor.year} month={cursor.month} />
            </div>
            <div className="card p-5">
              <h3 className="text-sm font-semibold text-secondary-c uppercase tracking-wide mb-2">Monthly trend</h3>
              <TrendChart allExpenses={effectiveExpenses} year={cursor.year} month={cursor.month} />
            </div>
          </div>

          <div className="space-y-5">
            <div className="flex gap-2">
              <button onClick={() => setModal("expense")} className="btn-primary flex-1 py-2.5 text-sm flex items-center justify-center gap-1.5">
                <IconPlus size={14} /> Expense
              </button>
              <button
                onClick={() => setModal("income")}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium text-white flex items-center justify-center gap-1.5"
                style={{ backgroundColor: "#5B8C7B" }}
              >
                <IconPlus size={14} /> Income
              </button>
              <button
                onClick={() => setModal("budget")}
                className="py-2.5 px-3 rounded-xl text-sm font-medium text-white flex items-center justify-center gap-1.5"
                style={{ backgroundColor: "#D3A85C" }}
                title="Recurring payments and income"
                aria-label="Recurring payments and income"
              >
                <IconRepeat size={14} />
              </button>
            </div>

            <MoneyReflection reflections={reflections} />

            <BudgetSummaryCard
              computedItems={budgetItemsComputed}
              totalPlanned={totalPlannedBudgeted}
              totalRemaining={totalPlannedRemaining}
              onOpenBudget={() => setModal("budget")}
            />

            <MonthlyFinancialSummary
              totalIncome={totalIncomeMonth}
              totalFixed={totalFixed}
              totalVariable={totalVariable}
              remainingBudget={remainingBudget}
              savings={savingsMonth}
              utilizationPct={budgetUtilizationPct}
              largestExpense={largestExpense}
              largestBudgetCategory={largestBudgetCategory}
            />

            <div className="card p-5">
              <h3 className="text-sm font-semibold text-secondary-c uppercase tracking-wide mb-2">Recent activity</h3>
              <TransactionHistory
                items={transactions}
                allItems={allTransactions}
                monthName={monthLabel(cursor.year, cursor.month)}
                onEdit={(item) => setEditing({ type: item.type, item })} onDelete={requestDelete} />
            </div>
          </div>
        </div>

        <footer className="text-center pt-4 space-y-1">
          <p className="text-xs text-muted-c">
            All data stays on this device, stored in your browser&apos;s local storage.
          </p>
          <button
            onClick={() => setModal("about")}
            className="text-xs text-muted-c underline underline-offset-2 hover:text-secondary-c transition-colors"
          >
            About &amp; privacy
          </button>
        </footer>

        {modal === "expense" && (
          <Modal title="Add expense" onClose={() => setModal(null)}>
            <ExpenseForm
              onSubmit={(entry) => {
                addExpense(entry);
                setModal(null);
              }}
            />
          </Modal>
        )}
        {modal === "income" && (
          <Modal title="Add income" onClose={() => setModal(null)}>
            <IncomeForm
              onSubmit={(entry) => {
                addIncome(entry);
                setModal(null);
              }}
            />
          </Modal>
        )}
        {modal === "settings" && (
          <SettingsModal
            onClose={() => setModal(null)}
            settings={data.settings}
            onUpdateSettings={updateSettings}
            fullData={data}
            onImport={importAll}
            onClearAll={clearAll}
          />
        )}
        {modal === "about" && <AboutModal onClose={() => setModal(null)} />}
        {modal === "budget" && (
          <BudgetModal
            onClose={() => setModal(null)}
            budgetItems={data.budgetItems || []}
            cursor={cursor}
            monthExpenses={monthExpenses}
            monthIncome={monthIncome}
            onAdd={addBudgetItem}
            onUpdate={updateBudgetItem}
            onDelete={deleteBudgetItem}
            entriesForItem={entriesForItem}
            onToggleActive={toggleBudgetItemActive}
            onReorder={reorderBudgetItem}
            onLogItem={logBudgetItem}
          />
        )}
        {editing && editing.type === "expense" && (
          <Modal title="Edit expense" onClose={() => setEditing(null)}>
            <ExpenseForm
              initial={editing.item}
              submitLabel="Save changes"
              onSubmit={(entry) => {
                updateExpense(entry);
                setEditing(null);
              }}
              onDelete={() => {
                requestDelete("expense", editing.item.id);
                setEditing(null);
              }}
            />
          </Modal>
        )}
        {editing && editing.type === "income" && (
          <Modal title="Edit income" onClose={() => setEditing(null)}>
            <IncomeForm
              initial={editing.item}
              submitLabel="Save changes"
              onSubmit={(entry) => {
                updateIncome(entry);
                setEditing(null);
              }}
              onDelete={() => {
                requestDelete("income", editing.item.id);
                setEditing(null);
              }}
            />
          </Modal>
        )}

        <UndoToast pending={pendingDelete} onUndo={undoDelete} />
      </div>
    </SettingsContext.Provider>
  );
}
