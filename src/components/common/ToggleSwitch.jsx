export function ToggleSwitch({ checked, onChange }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={"toggle-switch " + (checked ? "on" : "off")}
      aria-pressed={checked}
    >
      <span className="toggle-dot"></span>
    </button>
  );
}
