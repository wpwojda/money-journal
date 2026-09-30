import { useMemo, useRef, useState } from "react";
import { parseQuickAdd, guessCategory } from "../../lib/categorize.js";
import { todayISO } from "../../lib/dateUtils.js";
import { uid } from "../../lib/id.js";
import { currencySymbol } from "../../lib/format.js";
import { useSettings } from "../../context/SettingsContext.jsx";
import { IconPlus, CategoryIcon } from "../common/Icons.jsx";

export function QuickAddExpense({ onAdd, recentCategories }) {
  const [text, setText] = useState("");
  const [manualCategory, setManualCategory] = useState(null);
  const [flash, setFlash] = useState(false);
  const inputRef = useRef(null);
  const { settings, expenseCategories, customCategories, categoryColor } = useSettings();
  const customNames = useMemo(() => customCategories.map((c) => c.name), [customCategories]);

  const liveGuess = useMemo(() => {
    const parsed = parseQuickAdd(text);
    return parsed ? guessCategory(parsed.description, customNames) : null;
  }, [text, customNames]);

  const activeCategory = manualCategory || liveGuess;

  const orderedCategories = useMemo(() => {
    const recent = (recentCategories || []).filter((c) => expenseCategories.includes(c));
    const rest = expenseCategories.filter((c) => !recent.includes(c));
    return [...recent, ...rest];
  }, [recentCategories, expenseCategories]);

  function handleSubmit(e) {
    e.preventDefault();
    const parsed = parseQuickAdd(text);
    if (!parsed) {
      setFlash("error");
      setTimeout(() => setFlash(false), 900);
      return;
    }
    onAdd({
      id: uid(),
      amount: parsed.amount,
      date: todayISO(),
      category: manualCategory || guessCategory(parsed.description, customNames),
      description: parsed.description,
      paymentMethod: "Card",
      notes: "",
    });
    setText("");
    setManualCategory(null);
    setFlash("success");
    setTimeout(() => setFlash(false), 900);
    if (inputRef.current) inputRef.current.focus();
  }

  return (
    <div className="card p-5 md:p-6">
      <h2 className="text-lg font-semibold text-primary-c mb-1">Where did your money go today?</h2>
      <p className="text-sm text-muted-c mb-4">
        Type &quot;Coffee - 3&quot; and press enter, or tap a category to set it yourself.
      </p>
      <form onSubmit={handleSubmit} className="flex gap-2 mb-3">
        <input
          ref={inputRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={`Coffee - ${currencySymbol(settings.currency)}3`}
          className={"input-field flex-1 " + (flash === "error" ? "error" : "")}
        />
        <button type="submit" className="btn-primary px-5 py-3 flex items-center gap-1.5">
          <IconPlus size={16} /> Add
        </button>
      </form>
      <div className="flex flex-wrap gap-1.5">
        {orderedCategories.map((cat) => (
          <button
            type="button"
            key={cat}
            onClick={() => setManualCategory(cat === manualCategory ? null : cat)}
            className={"chip " + (activeCategory === cat ? "selected" : "")}
            style={activeCategory === cat ? { backgroundColor: categoryColor(cat), color: "#fff" } : {}}
          >
            <CategoryIcon category={cat} size={12} /> {cat}
          </button>
        ))}
      </div>
      {flash === "success" && <div className="text-xs text-emerald-500 mt-2 fade-in">Added ✓</div>}
      {flash === "error" && (
        <div className="text-xs text-rose-400 mt-2 fade-in">
          Try &quot;description - amount&quot;, e.g. &quot;Lunch - 8&quot;
        </div>
      )}
    </div>
  );
}
