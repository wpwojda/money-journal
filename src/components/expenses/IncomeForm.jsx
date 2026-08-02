import { useState } from "react";
import { INCOME_SOURCES } from "../../constants.js";
import { todayISO } from "../../lib/dateUtils.js";
import { uid } from "../../lib/id.js";
import { IconTrash } from "../common/Icons.jsx";
import { FormField } from "../common/FormField.jsx";

export function IncomeForm({ initial, onSubmit, onDelete, submitLabel }) {
  const [amount, setAmount] = useState(initial ? String(initial.amount) : "");
  const [date, setDate] = useState(initial ? initial.date : todayISO());
  const [source, setSource] = useState(initial ? initial.source : "Salary");
  const [notes, setNotes] = useState(initial ? initial.notes : "");
  const [error, setError] = useState(false);

  function submit(e) {
    e.preventDefault();
    const amt = parseFloat(amount);
    if (!amt || amt <= 0 || !date) {
      setError(true);
      return;
    }
    onSubmit({ id: initial ? initial.id : uid(), amount: amt, date, source, notes: notes.trim() });
  }

  return (
    <form onSubmit={submit}>
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
        <div className="flex flex-wrap gap-1.5">
          {INCOME_SOURCES.map((s) => (
            <button
              type="button"
              key={s}
              onClick={() => setSource(s)}
              className={"chip " + (source === s ? "selected" : "")}
              style={source === s ? { backgroundColor: "#5B8C7B", color: "#fff" } : {}}
            >
              {s}
            </button>
          ))}
        </div>
      </FormField>
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
