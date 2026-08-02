import { useState } from "react";
import { EXPENSE_CATEGORIES, CATEGORY_COLORS, PAYMENT_METHODS } from "../../constants.js";
import { todayISO } from "../../lib/dateUtils.js";
import { uid } from "../../lib/id.js";
import { CategoryIcon, IconTrash } from "../common/Icons.jsx";
import { FormField } from "../common/FormField.jsx";

export function ExpenseForm({ initial, onSubmit, onDelete, submitLabel }) {
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
      id: initial ? initial.id : uid(),
      amount: amt,
      date,
      category,
      description: description.trim(),
      paymentMethod,
      notes: notes.trim(),
      budgetItemId: initial ? initial.budgetItemId : undefined,
    });
  }

  return (
    <form onSubmit={submit}>
      {initial && initial.budgetItemId && (
        <div className="text-xs text-muted-c mb-3 surface-muted rounded-lg px-3 py-2">
          Linked to a budget item — editing this won&apos;t change the budget item itself.
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
        <div className="flex flex-wrap gap-1.5">
          {EXPENSE_CATEGORIES.map((c) => (
            <button
              type="button"
              key={c}
              onClick={() => setCategory(c)}
              className={"chip " + (category === c ? "selected" : "")}
              style={category === c ? { backgroundColor: CATEGORY_COLORS[c], color: "#fff" } : {}}
            >
              <CategoryIcon category={c} size={12} /> {c}
            </button>
          ))}
        </div>
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
