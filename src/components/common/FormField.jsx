export function FormField({ label, children }) {
  return (
    <div className="mb-4">
      <label className="block text-xs font-medium text-muted-c uppercase tracking-wide mb-1.5">
        {label}
      </label>
      {children}
    </div>
  );
}
