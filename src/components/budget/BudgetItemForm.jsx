import { useState } from "react";
import { RECURRENCE_TYPES, RECURRENCE_LABELS } from "../../constants.js";
import { clamp, todayISO } from "../../lib/dateUtils.js";
import { guessCategory } from "../../lib/categorize.js";
import { WEEKDAY_NAMES } from "../../lib/budget.js";
import { useSettings } from "../../context/SettingsContext.jsx";
import { ChipPicker } from "../common/ChipPicker.jsx";
import { uid } from "../../lib/id.js";
import { FormField } from "../common/FormField.jsx";
import { ToggleSwitch } from "../common/ToggleSwitch.jsx";

export function BudgetItemForm({ initial, onSubmit, onCancel }) {
  const { expenseCategories, incomeSources, customCategories, categoryColor, addExpenseCategory, addIncomeSource } =
    useSettings();
  const [type, setType] = useState(initial && initial.type === "income" ? "income" : "expense");
  const [name, setName] = useState(initial ? initial.name : "");
  const [amount, setAmount] = useState(initial ? String(initial.amount) : "");
  // Older items used separate budget categories (Housing, Utilities...). When editing one of
  // those, start from a best guess among the transaction categories instead.
  const [category, setCategory] = useState(() => {
    if (!initial || initial.type === "income") return "Bills";
    if (expenseCategories.includes(initial.category)) return initial.category;
    return guessCategory(initial.name, customCategories.map((c) => c.name));
  });
  const [monthlyRule, setMonthlyRule] = useState(initial && initial.monthlyRule === "lastWeekday" ? "lastWeekday" : "day");
  const [weekday, setWeekday] = useState(initial && typeof initial.weekday === "number" ? initial.weekday : 5);
  const [countsNextMonth, setCountsNextMonth] = useState(initial ? initial.countsNextMonth === true : false);
  const [recurrence, setRecurrence] = useState(initial ? initial.recurrence : "monthly");
  const [dueDay, setDueDay] = useState(initial && initial.dueDay ? String(initial.dueDay) : "");
  const [dueDate, setDueDate] = useState(initial && initial.dueDate ? initial.dueDate : "");
  const [notes, setNotes] = useState(initial ? initial.notes : "");
  const [active, setActive] = useState(initial ? initial.active !== false : true);
  const [autoLog, setAutoLog] = useState(initial ? initial.autoLog === true : true);
  // Default start: the 1st of this month, so anything already due this month is logged too.
  const [startDate, setStartDate] = useState(
    initial && initial.startDate ? initial.startDate : todayISO().slice(0, 8) + "01"
  );
  const [incomeSource, setIncomeSource] = useState(
    initial && initial.type === "income" && initial.category ? initial.category : "Salary"
  );
  const [error, setError] = useState("");

  const needsFullDate = recurrence === "yearly" || recurrence === "onetime";

  function submit(e) {
    e.preventDefault();
    const amt = parseFloat(amount);
    if (!name.trim() || !amt || amt <= 0) {
      setError("Add a name and an amount greater than zero.");
      return;
    }
    if (autoLog && recurrence !== "onetime" && !startDate) {
      setError("Pick a date to start logging from.");
      return;
    }
    if (needsFullDate && !dueDate) {
      setError("This recurrence needs a due date so we know which month it applies to.");
      return;
    }

    if (recurrence === "monthly" && monthlyRule === "day" && !dueDay) {
      setError("Enter the day of the month it's due, or choose a weekday rule.");
      return;
    }
    const finalCategory = type === "income" ? incomeSource : category;
    const isMonthly = recurrence === "monthly";

    onSubmit({
      id: initial ? initial.id : uid(),
      name: name.trim(),
      amount: amt,
      category: finalCategory,
      recurrence,
      dueDay: (recurrence === "monthly" || recurrence === "weekly") && dueDay ? clamp(parseInt(dueDay, 10) || 1, 1, 31) : null,
      dueDate: needsFullDate ? dueDate : null,
      notes: notes.trim(),
      active,
      order: initial ? initial.order : Date.now(),
      type,
      autoLog,
      // One-time items only ever fall on their due date.
      startDate: autoLog ? (recurrence === "onetime" ? dueDate : startDate) : initial ? initial.startDate : null,
      skipped: initial && Array.isArray(initial.skipped) ? initial.skipped : [],
      monthlyRule: isMonthly ? monthlyRule : "day",
      weekday,
      countsNextMonth: type === "income" && isMonthly && countsNextMonth,
    });
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="flex gap-2">
        {[
          ["expense", "Money out"],
          ["income", "Money in"],
        ].map(([t, label]) => (
          <button
            type="button"
            key={t}
            onClick={() => setType(t)}
            className={"flex-1 py-2 rounded-xl text-sm font-medium border-soft border " + (type === t ? "btn-primary" : "btn-ghost")}
          >
            {label}
          </button>
        ))}
      </div>
      <FormField label="Name">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="input-field"
          placeholder={type === "income" ? "e.g. Salary, Freelance retainer" : "e.g. Rent, Netflix, Gym"}
          autoFocus
        />
      </FormField>
      <FormField
        label={
          recurrence === "weekly"
            ? "Amount each week"
            : recurrence === "yearly"
              ? "Amount each year"
              : recurrence === "onetime"
                ? "Amount"
                : "Amount each month"
        }
      >
        <input
          type="number"
          step="0.01"
          min="0"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="input-field"
          placeholder="0.00"
        />
      </FormField>
      {type === "income" ? (
        <FormField label="Source">
          <ChipPicker
            options={incomeSources.includes(incomeSource) ? incomeSources : [...incomeSources, incomeSource]}
            value={incomeSource}
            onChange={setIncomeSource}
            colorFor={() => "#5B8C7B"}
            onCreate={addIncomeSource}
            newLabel="New source"
          />
        </FormField>
      ) : (
        <FormField label="Category">
          <ChipPicker
            options={expenseCategories}
            value={category}
            onChange={setCategory}
            colorFor={categoryColor}
            onCreate={addExpenseCategory}
            showIcons
            newLabel="New category"
          />
        </FormField>
      )}
      <FormField label="Recurrence">
        <div className="flex flex-wrap gap-1.5">
          {RECURRENCE_TYPES.map((r) => (
            <button
              type="button"
              key={r}
              onClick={() => setRecurrence(r)}
              className={"chip " + (recurrence === r ? "selected" : "")}
              style={recurrence === r ? { backgroundColor: "#7FA3C4", color: "#fff" } : {}}
            >
              {RECURRENCE_LABELS[r]}
            </button>
          ))}
        </div>
      </FormField>
      {recurrence === "monthly" && (
        <FormField label="Due on">
          <div className="flex gap-2 mb-2">
            {[
              ["day", "A set day"],
              ["lastWeekday", "Last weekday of month"],
            ].map(([rule, label]) => (
              <button
                type="button"
                key={rule}
                onClick={() => setMonthlyRule(rule)}
                className={
                  "flex-1 py-2 rounded-xl text-sm font-medium border-soft border " +
                  (monthlyRule === rule ? "btn-primary" : "btn-ghost")
                }
              >
                {label}
              </button>
            ))}
          </div>
          {monthlyRule === "day" ? (
            <input
              type="number"
              min="1"
              max="31"
              value={dueDay}
              onChange={(e) => setDueDay(e.target.value)}
              className="input-field"
              placeholder="Day of the month, e.g. 1"
            />
          ) : (
            <select
              value={weekday}
              onChange={(e) => setWeekday(parseInt(e.target.value, 10))}
              className="input-field"
            >
              {[1, 2, 3, 4, 5, 6, 0].map((d) => (
                <option key={d} value={d}>
                  Last {WEEKDAY_NAMES[d]} of the month
                </option>
              ))}
            </select>
          )}
        </FormField>
      )}
      {type === "income" && recurrence === "monthly" && (
        <div className="flex items-center justify-between surface-muted rounded-xl px-3.5 py-2.5 gap-3">
          <span className="text-sm text-secondary-c">
            Counts towards next month&apos;s budget
            <span className="block text-xs text-muted-c">
              For pay that arrives at the end of one month to cover the next.
            </span>
          </span>
          <ToggleSwitch checked={countsNextMonth} onChange={setCountsNextMonth} />
        </div>
      )}
      {needsFullDate && (
        <FormField label={recurrence === "yearly" ? "Due date (repeats every year on this date)" : "Due date"}>
          <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="input-field" />
        </FormField>
      )}
      <FormField label="Notes (optional)">
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="input-field"
          rows="2"
          placeholder="Anything else to remember"
        ></textarea>
      </FormField>
      <div className="surface-muted rounded-xl px-3.5 py-2.5 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm text-secondary-c">Log automatically on the due date</span>
          <ToggleSwitch checked={autoLog} onChange={setAutoLog} />
        </div>
        {autoLog && recurrence !== "onetime" && (
          <div>
            <label className="block text-xs font-medium text-muted-c uppercase tracking-wide mb-1.5">
              {recurrence === "weekly" ? "First date (repeats every 7 days)" : "Start logging from"}
            </label>
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="input-field" />
            <p className="text-xs text-muted-c mt-1.5">
              Anything due between this date and today is added straight away. After that, each one appears on its
              due date. Delete a single entry to skip it.
            </p>
          </div>
        )}
        {!autoLog && (
          <p className="text-xs text-muted-c">Off: it shows as due each month and you tap Log when it&apos;s paid.</p>
        )}
      </div>
      <div className="flex items-center justify-between surface-muted rounded-xl px-3.5 py-2.5">
        <span className="text-sm text-secondary-c">Active</span>
        <ToggleSwitch checked={active} onChange={setActive} />
      </div>
      {error && <p className="text-xs text-rose-400">{error}</p>}
      <div className="flex gap-2">
        <button type="button" onClick={onCancel} className="btn-ghost flex-1 py-2.5">
          Cancel
        </button>
        <button type="submit" className="btn-primary flex-1 py-2.5">
          {initial ? "Save changes" : "Add recurring item"}
        </button>
      </div>
    </form>
  );
}
