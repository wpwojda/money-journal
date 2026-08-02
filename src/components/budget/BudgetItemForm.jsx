import { useState } from "react";
import { RECURRENCE_TYPES, RECURRENCE_LABELS } from "../../constants.js";
import { clamp } from "../../lib/dateUtils.js";
import { uid } from "../../lib/id.js";
import { FormField } from "../common/FormField.jsx";
import { ToggleSwitch } from "../common/ToggleSwitch.jsx";

export function BudgetItemForm({ initial, categories, onAddCategory, onSubmit, onCancel }) {
  const [name, setName] = useState(initial ? initial.name : "");
  const [amount, setAmount] = useState(initial ? String(initial.amount) : "");
  const [category, setCategory] = useState(initial ? initial.category : categories[0]);
  const [newCategoryMode, setNewCategoryMode] = useState(false);
  const [newCategoryText, setNewCategoryText] = useState("");
  const [recurrence, setRecurrence] = useState(initial ? initial.recurrence : "monthly");
  const [dueDay, setDueDay] = useState(initial && initial.dueDay ? String(initial.dueDay) : "");
  const [dueDate, setDueDate] = useState(initial && initial.dueDate ? initial.dueDate : "");
  const [notes, setNotes] = useState(initial ? initial.notes : "");
  const [active, setActive] = useState(initial ? initial.active !== false : true);
  const [error, setError] = useState("");

  const needsFullDate = recurrence === "yearly" || recurrence === "onetime";

  function handleCategorySelect(e) {
    if (e.target.value === "__new__") {
      setNewCategoryMode(true);
      setNewCategoryText("");
    } else {
      setNewCategoryMode(false);
      setCategory(e.target.value);
    }
  }

  function submit(e) {
    e.preventDefault();
    const amt = parseFloat(amount);
    if (!name.trim() || !amt || amt <= 0) {
      setError("Add a name and an amount greater than zero.");
      return;
    }
    if (needsFullDate && !dueDate) {
      setError("This recurrence needs a due date so we know which month it applies to.");
      return;
    }

    let finalCategory = category;
    if (newCategoryMode) {
      finalCategory = newCategoryText.trim();
      if (!finalCategory) {
        setError("Enter a name for the new category, or pick an existing one.");
        return;
      }
      onAddCategory(finalCategory);
    }

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
    });
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <FormField label="Name">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="input-field"
          placeholder="e.g. Rent, Netflix, Gym"
          autoFocus
        />
      </FormField>
      <FormField label="Monthly amount">
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
      <FormField label="Category">
        {!newCategoryMode ? (
          <select value={category} onChange={handleCategorySelect} className="input-field">
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
            <option value="__new__">+ Create new category…</option>
          </select>
        ) : (
          <div className="flex gap-2">
            <input
              value={newCategoryText}
              onChange={(e) => setNewCategoryText(e.target.value)}
              className="input-field"
              placeholder="New category name"
              autoFocus
            />
            <button type="button" onClick={() => setNewCategoryMode(false)} className="btn-ghost px-3">
              Cancel
            </button>
          </div>
        )}
      </FormField>
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
      {(recurrence === "monthly" || recurrence === "weekly") && (
        <FormField label="Due day of month (optional)">
          <input
            type="number"
            min="1"
            max="31"
            value={dueDay}
            onChange={(e) => setDueDay(e.target.value)}
            className="input-field"
            placeholder="e.g. 1"
          />
        </FormField>
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
          {initial ? "Save changes" : "Add budget item"}
        </button>
      </div>
    </form>
  );
}
