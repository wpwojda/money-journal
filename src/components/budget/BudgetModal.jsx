import { useMemo, useState } from "react";
import { RECURRENCE_LABELS } from "../../constants.js";
import { monthLabel } from "../../lib/dateUtils.js";
import { formatCurrency } from "../../lib/format.js";
import { isApplicableThisMonth, plannedAmountForItem, paidAmountForItem, statusForItem } from "../../lib/budget.js";
import { Modal } from "../common/Modal.jsx";
import { IconPlus, IconChevron, IconEdit, IconTrash } from "../common/Icons.jsx";
import { ToggleSwitch } from "../common/ToggleSwitch.jsx";
import { StatusPill } from "../common/StatusPill.jsx";
import { BudgetItemForm } from "./BudgetItemForm.jsx";

export function BudgetModal({
  onClose,
  budgetItems,
  budgetCategories,
  cursor,
  monthExpenses,
  onAdd,
  onUpdate,
  onDelete,
  onToggleActive,
  onReorder,
  onAddCategory,
  onLogItem,
}) {
  const [formOpen, setFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const sorted = useMemo(() => budgetItems.slice().sort((a, b) => a.order - b.order), [budgetItems]);

  const rows = useMemo(
    () =>
      sorted.map((it) => {
        const applicable = isApplicableThisMonth(it, cursor);
        const planned = applicable ? plannedAmountForItem(it) : 0;
        const paid = applicable ? paidAmountForItem(it, monthExpenses) : 0;
        const status = applicable ? statusForItem(it, planned, paid, cursor) : null;
        return { ...it, applicable, planned, paid, status };
      }),
    [sorted, cursor, monthExpenses]
  );

  if (formOpen || editingItem) {
    return (
      <Modal
        title={editingItem ? "Edit budget item" : "Add budget item"}
        onClose={() => {
          setFormOpen(false);
          setEditingItem(null);
        }}
        wide
      >
        <BudgetItemForm
          initial={editingItem}
          categories={budgetCategories}
          onAddCategory={onAddCategory}
          onCancel={() => {
            setFormOpen(false);
            setEditingItem(null);
          }}
          onSubmit={(item) => {
            editingItem ? onUpdate(item) : onAdd(item);
            setFormOpen(false);
            setEditingItem(null);
          }}
        />
      </Modal>
    );
  }

  return (
    <Modal title="Budget" onClose={onClose} wide>
      <p className="text-sm text-muted-c mb-4">
        Recurring bills and planned costs, tracked automatically each month. Viewing{" "}
        {monthLabel(cursor.year, cursor.month)}.
      </p>
      <button onClick={() => setFormOpen(true)} className="btn-primary w-full py-2.5 mb-4 flex items-center justify-center gap-1.5">
        <IconPlus size={15} /> Add budget item
      </button>

      {rows.length === 0 ? (
        <p className="text-sm text-muted-c text-center py-8">
          No budget items yet. Add rent, subscriptions, or any recurring cost above.
        </p>
      ) : (
        <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-1">
          {rows.map((it, i) => (
            <div key={it.id} className={"surface-muted rounded-xl p-3.5 " + (it.active ? "" : "opacity-50")}>
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-sm font-medium text-primary-c truncate">{it.name}</span>
                  <span className="text-xs text-muted-c shrink-0">{it.category}</span>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => onReorder(it.id, "up")}
                    disabled={i === 0}
                    className="p-1 text-muted-c hover:text-primary-c disabled:opacity-20"
                  >
                    <IconChevron dir="up" size={14} />
                  </button>
                  <button
                    onClick={() => onReorder(it.id, "down")}
                    disabled={i === rows.length - 1}
                    className="p-1 text-muted-c hover:text-primary-c disabled:opacity-20"
                  >
                    <IconChevron dir="down" size={14} />
                  </button>
                  <button onClick={() => setEditingItem(it)} className="p-1 text-muted-c hover:text-primary-c">
                    <IconEdit size={14} />
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm(`Delete "${it.name}" from your budget?`)) onDelete(it.id);
                    }}
                    className="p-1 text-muted-c hover:text-rose-400"
                  >
                    <IconTrash size={14} />
                  </button>
                  <ToggleSwitch checked={it.active} onChange={() => onToggleActive(it.id)} />
                </div>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-c">
                  {RECURRENCE_LABELS[it.recurrence]}
                  {it.applicable ? ` · ${formatCurrency(it.planned, "EUR")} planned` : " · not due this month"}
                </span>
                {it.applicable ? (
                  <div className="flex items-center gap-2">
                    <span className="text-secondary-c">Paid {formatCurrency(it.paid, "EUR")}</span>
                    <StatusPill status={it.status} />
                    {it.paid < it.planned && (
                      <button onClick={() => onLogItem(it)} className="btn-primary px-2.5 py-1 text-xs">
                        Log
                      </button>
                    )}
                  </div>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      )}
    </Modal>
  );
}
