export function UndoToast({ pending, onUndo }) {
  if (!pending) return null;
  return (
    <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 card px-4 py-3 flex items-center gap-4 slide-up shadow-lg">
      <span className="text-sm text-primary-c">Deleted {pending.item.description || pending.item.source || "entry"}</span>
      <button onClick={onUndo} className="text-sm font-semibold" style={{ color: "#7FA3C4" }}>
        Undo
      </button>
    </div>
  );
}
