import { useState } from "react";
import { CategoryIcon, IconPlus } from "./Icons.jsx";

/**
 * A row of selectable chips with a "+ New" chip at the end. Creating a new option calls
 * onCreate(name), which returns the name actually stored (an existing match if the user
 * typed one that already exists), and selects it.
 */
export function ChipPicker({ options, value, onChange, colorFor, onCreate, showIcons = false, newLabel = "New" }) {
  const [adding, setAdding] = useState(false);
  const [text, setText] = useState("");

  function commit() {
    const created = onCreate(text);
    if (created) onChange(created);
    setText("");
    setAdding(false);
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((opt) => (
        <button
          type="button"
          key={opt}
          onClick={() => onChange(opt)}
          className={"chip " + (value === opt ? "selected" : "")}
          style={value === opt ? { backgroundColor: colorFor(opt), color: "#fff" } : {}}
        >
          {showIcons && <CategoryIcon category={opt} size={12} />} {opt}
        </button>
      ))}
      {onCreate &&
        (adding ? (
          <span className="inline-flex items-center gap-1">
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  commit();
                }
                if (e.key === "Escape") setAdding(false);
              }}
              className="input-field py-1 px-2.5 text-xs w-32"
              placeholder="Name"
              maxLength={24}
              autoFocus
            />
            <button type="button" onClick={commit} className="chip">
              Add
            </button>
          </span>
        ) : (
          <button type="button" onClick={() => setAdding(true)} className="chip" style={{ borderStyle: "dashed" }}>
            <IconPlus size={11} /> {newLabel}
          </button>
        ))}
    </div>
  );
}
