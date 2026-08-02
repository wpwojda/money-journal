export function MoneyReflection({ reflections }) {
  return (
    <div
      className="rounded-2xl p-5 md:p-6 border border-soft"
      style={{ background: "linear-gradient(135deg, var(--surface-muted), var(--surface))" }}
    >
      <h3 className="text-sm font-semibold text-secondary-c uppercase tracking-wide mb-3 flex items-center gap-2">
        <span>✦</span> Money Reflection
      </h3>
      <div className="space-y-2">
        {reflections.map((r, i) => (
          <p key={i} className="text-primary-c leading-relaxed">
            {r}
          </p>
        ))}
      </div>
    </div>
  );
}
