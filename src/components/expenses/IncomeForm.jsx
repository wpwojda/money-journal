import { useState } from "react";
import { todayISO, monthKeyOf, monthLabel } from "../../lib/dateUtils.js";
import { nextMonthKey } from "../../lib/recurring.js";
import { useSettings } from "../../context/SettingsContext.jsx";
import { ChipPicker } from "../common/ChipPicker.jsx";
import { ToggleSwitch } from "../common/ToggleSwitch.jsx";
import { uid } from "../../lib/id.js";
import { IconTrash } from "../common/Icons.jsx";
import { FormField } from "../common/FormField.jsx";

export function IncomeForm({ initial, onSubmit, onDelete, submitLabel }) {
  const [amount, setAmount] = useState(initial ? String(initial.amount) : "");
  const [date, setDate] = useState(initial ? initial.date : todayISO());
  const [source, setSource] = useState(initial ? initial.source : "Salary");
  const [notes, setNotes] = useState(initial ? initial.notes : "");
  const [error, setError] = useState(false);
  const [forNextMonth, setForNextMonth] = useState(
    !!(initial && initial.budgetMonth && initial.budgetMonth !== monthKeyOf(initial.date))
  );
  const { incomeSources, addIncomeSource } = useSettings();

  function submit(e) {
    e.preventDefault();
    const amt = parseFloat(amount);
    if (!amt || amt <= 0 || !date) {
      setError(true);
      return;
    }
    // Spread `initial` first so edits keep links like budgetItemId and description.
    const entry = { ...(initial || {}), id: initial ? initial.id : uid(), amount: amt, date, source, notes: notes.trim() };
    if (forNextMonth) entry.budgetMonth = nextMonthKey(date);
    else delete entry.budgetMonth;
    onSubmit(entry);
  }

  return (
    <form onSubmit={submit}>
      {initial && initial.budgetItemId && (
        <div className="text-xs text-muted-c mb-3 surface-muted rounded-lg px-3 py-2">
          Logged by a recurring item{initial.description ? ` (${initial.description})` : ""}. Editing this only changes
          this one entry. Deleting it skips this occurrence.
        </div>
      )}
      <FormField label="Amount">
        <input
          type="number"
          step="0.01"
          min="0"
          value={amount}
          onChange={(e) => {
            setAmount(e.target.value);
            setError(false);
          }}
          className={"input-field " + (error ? "error" : "")}
          placeholder="0.00"
          autoFocus
        />
      </FormField>
      <FormField label="Date">
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="input-field" />
      </FormField>
      <FormField label="Source">
        <ChipPicker
          options={incomeSources.includes(source) ? incomeSources : [...incomeSources, source]}
          value={source}
          onChange={setSource}
          colorFor={() => "#5B8C7B"}
          onCreate={addIncomeSource}
          newLabel="New source"
        />
      </FormField>
      <div className="flex items-center justify-between surface-muted rounded-xl px-3.5 py-2.5 mb-4 gap-3">
        <span className="text-sm text-secondary-c">
          Counts towards next month&apos;s budget
          {forNextMonth && date && (
            <span className="block text-xs text-muted-c">
              Included in {monthLabel(+nextMonthKey(date).slice(0, 4), +nextMonthKey(date).slice(5, 7))}
            </span>
          )}
        </span>
        <ToggleSwitch checked={forNextMonth} onChange={setForNextMonth} />
      </div>
      <FormField label="Notes (optional)">
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="input-field"
          rows="2"
          placeholder="Anything else to remember"
        ></textarea>
      </FormField>
      <div className="flex gap-2 mt-1">
        {onDelete && (
          <button type="button" onClick={onDelete} className="btn-ghost px-4 py-3">
            <IconTrash size={16} />
          </button>
        )}
        <button type="submit" className="btn-primary flex-1 py-3">
          {submitLabel || "Save income"}
        </button>
      </div>
    </form>
  );
}
