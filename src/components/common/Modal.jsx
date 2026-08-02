import { IconClose } from "./Icons.jsx";

export function Modal({ title, onClose, children, wide }) {
  return (
    <div
      className="fixed inset-0 bg-black/30 modal-backdrop flex items-end md:items-center justify-center z-50 fade-in"
      onClick={onClose}
    >
      <div
        className={
          "card rounded-t-3xl md:rounded-3xl w-full max-h-[90vh] overflow-y-auto p-6 slide-up " +
          (wide ? "md:w-[600px]" : "md:w-[440px]")
        }
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-semibold text-primary-c">{title}</h3>
          <button onClick={onClose} className="text-muted-c hover:text-primary-c p-1">
            <IconClose size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
