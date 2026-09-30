import { useState } from "react";
import { EXPENSE_CATEGORIES, INCOME_SOURCES } from "../../constants.js";
import { useSettings } from "../../context/SettingsContext.jsx";
import { IconClose, IconPlus } from "../common/Icons.jsx";

function AddRow({ placeholder, onAdd }) {
  const [text, setText] = useState("");
  function submit(e) {
    e.preventDefault();
    if (!text.trim()) return;
    onAdd(text);
    setText("");
  }
  return (
    <form onSubmit={submit} className="flex gap-2 mt-2.5">
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="input-field py-2 text-sm"
        placeholder={placeholder}
        maxLength={24}
      />
      <button type="submit" className="btn-primary px-3 text-sm flex items-center gap-1 shrink-0">
        <IconPlus size={13} /> Add
      </button>
    </form>
  );
}

export function CategoriesPanel() {
  const {
    customCategories,
    customIncomeSources,
    categoryColor,
    addExpenseCategory,
    addIncomeSource,
    deleteExpenseCategory,
    deleteIncomeSource,
  } = useSettings();

  function confirmDelete(name, kind, onDelete) {
    if (window.confirm(`Delete "${name}"? Anything filed under this ${kind} moves to "Other".`)) onDelete(name);
  }

  return (
    <div className="space-y-6">
      <section>
        <h4 className="text-xs font-medium text-muted-c uppercase tracking-wide mb-2">Expense categories</h4>
        <div className="flex flex-wrap gap-1.5">
          {EXPENSE_CATEGORIES.map((c) => (
            <span key={c} className="chip" style={{ cursor: "default" }}>
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: categoryColor(c) }}></span>
              {c}
            </span>
          ))}
          {customCategories.map((c) => (
            <span key={c.name} className="chip" style={{ cursor: "default", borderColor: c.color }}>
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: c.color }}></span>
              {c.name}
              <button
                type="button"
                onClick={() => confirmDelete(c.name, "category", deleteExpenseCategory)}
                className="text-muted-c hover:text-rose-400 ml-0.5"
                aria-label={`Delete ${c.name}`}
              >
                <IconClose size={11} />
              </button>
            </span>
          ))}
        </div>
        <AddRow placeholder="New category, e.g. Pets" onAdd={addExpenseCategory} />
      </section>

      <section>
        <h4 className="text-xs font-medium text-muted-c uppercase tracking-wide mb-2">Income sources</h4>
        <div className="flex flex-wrap gap-1.5">
          {INCOME_SOURCES.map((s) => (
            <span key={s} className="chip" style={{ cursor: "default" }}>
              {s}
            </span>
          ))}
          {customIncomeSources.map((s) => (
            <span key={s} className="chip" style={{ cursor: "default" }}>
              {s}
              <button
                type="button"
                onClick={() => confirmDelete(s, "source", deleteIncomeSource)}
                className="text-muted-c hover:text-rose-400 ml-0.5"
                aria-label={`Delete ${s}`}
              >
                <IconClose size={11} />
              </button>
            </span>
          ))}
        </div>
        <AddRow placeholder="New source, e.g. Rental income" onAdd={addIncomeSource} />
      </section>

      <p className="text-xs text-muted-c">
        Built-in categories can&apos;t be removed. You can also add new ones on the fly from the expense, income
        and recurring forms. Quick-add recognises your own categories by name, so &quot;Pets - 12&quot; goes
        straight into Pets.
      </p>
    </div>
  );
}
