import { useState } from "react";
import { PAYMENT_METHODS } from "../../constants.js";
import { useSettings } from "../../context/SettingsContext.jsx";
import { ChipPicker } from "../common/ChipPicker.jsx";
import { todayISO } from "../../lib/dateUtils.js";
import { uid } from "../../lib/id.js";
import { IconTrash } from "../common/Icons.jsx";
import { FormField } from "../common/FormField.jsx";

export function ExpenseForm({ initial, onSubmit, onDelete, submitLabel }) {
  const { expenseCategories, categoryColor, addExpenseCategory } = useSettings();
  const [amount, setAmount] = useState(initial ? String(initial.amount) : "");
  const [date, setDate] = useState(initial ? initial.date : todayISO());
  const [category, setCategory] = useState(initial ? initial.category : "Food");
  const [description, setDescription] = useState(initial ? initial.description : "");
  const [paymentMethod, setPaymentMethod] = useState(initial ? initial.paymentMethod : "Cash");
  const [notes, setNotes] = useState(initial ? initial.notes : "");
  const [error, setError] = useState(false);

  function submit(e) {
    e.preventDefault();
    const amt = parseFloat(amount);
    if (!amt || amt <= 0 || !date) {
      setError(true);
      return;
    }
    onSubmit({
      // Spread `initial` first so edits keep links like budgetItemId and occurrence.
      ...(initial || {}),
      id: initial ? initial.id : uid(),
      amount: amt,
      date,
      category,
      description: description.trim(),
      paymentMethod,
      notes: notes.trim(),
    });
  }

  return (
    <form onSubmit={submit}>
      {initial && initial.budgetItemId && (
        <div className="text-xs text-muted-c mb-3 surface-muted rounded-lg px-3 py-2">
          Logged by a recurring item. Editing this only changes this one entry. Deleting it skips this occurrence.
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
      <FormField label="Category">
        <ChipPicker
          options={expenseCategories.includes(category) ? expenseCategories : [...expenseCategories, category]}
          value={category}
          onChange={setCategory}
          colorFor={categoryColor}
          onCreate={addExpenseCategory}
          showIcons
          newLabel="New category"
        />
      </FormField>
      <FormField label="Description">
        <input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="input-field"
          placeholder="What was it for?"
        />
      </FormField>
      <FormField label="Payment method">
        <div className="flex gap-2">
          {PAYMENT_METHODS.map((m) => (
            <button
              type="button"
              key={m}
              onClick={() => setPaymentMethod(m)}
              className={"flex-1 py-2 rounded-xl text-sm font-medium border-soft border " + (paymentMethod === m ? "btn-primary" : "btn-ghost")}
            >
              {m}
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
          {submitLabel || "Save expense"}
        </button>
      </div>
    </form>
  );
}
