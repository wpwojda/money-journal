import { useMemo, useState } from "react";
import { monthLabel } from "../../lib/dateUtils.js";
import { useSettings } from "../../context/SettingsContext.jsx";
import { itemType } from "../../lib/recurring.js";
import { describeSchedule, isApplicableThisMonth, plannedAmountForItem, paidAmountForItem, statusForItem } from "../../lib/budget.js";
import { Modal } from "../common/Modal.jsx";
import { IconPlus, IconChevron, IconEdit, IconTrash, IconRepeat } from "../common/Icons.jsx";
import { ToggleSwitch } from "../common/ToggleSwitch.jsx";
import { StatusPill } from "../common/StatusPill.jsx";
import { BudgetItemForm } from "./BudgetItemForm.jsx";

export function BudgetModal({
  onClose,
  budgetItems,
  cursor,
  monthExpenses,
  monthIncome,
  onAdd,
  onUpdate,
  onDelete,
  entriesForItem,
  onToggleActive,
  onReorder,
  onLogItem,
}) {
  const [formOpen, setFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const { formatCurrency: fmt } = useSettings();

  const sorted = useMemo(() => budgetItems.slice().sort((a, b) => a.order - b.order), [budgetItems]);

  const rows = useMemo(
    () =>
      sorted.map((it) => {
        const applicable = isApplicableThisMonth(it, cursor);
        const planned = applicable ? plannedAmountForItem(it) : 0;
        const txs = itemType(it) === "income" ? monthIncome : monthExpenses;
        const paid = applicable ? paidAmountForItem(it, txs) : 0;
        const status = applicable ? statusForItem(it, planned, paid, cursor) : null;
        return { ...it, applicable, planned, paid, status };
      }),
    [sorted, cursor, monthExpenses, monthIncome]
  );

  if (formOpen || editingItem) {
    return (
      <Modal
        title={editingItem ? "Edit recurring item" : "Add recurring item"}
        onClose={() => {
          setFormOpen(false);
          setEditingItem(null);
        }}
        wide
      >
        <BudgetItemForm
          initial={editingItem}
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
    <Modal title="Recurring" onClose={onClose} wide>
      <p className="text-sm text-muted-c mb-4">
        Bills, subscriptions and regular income. Items set to log automatically are added to your
        transactions on their due date. Viewing {monthLabel(cursor.year, cursor.month)}.
      </p>
      <button onClick={() => setFormOpen(true)} className="btn-primary w-full py-2.5 mb-4 flex items-center justify-center gap-1.5">
        <IconPlus size={15} /> Add recurring item
      </button>

      {rows.length === 0 ? (
        <p className="text-sm text-muted-c text-center py-8">
          Nothing yet. Add rent, subscriptions, your salary, or anything else that repeats.
        </p>
      ) : (
        <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-1">
          {rows.map((it, i) => (
            <div key={it.id} className={"surface-muted rounded-xl p-3.5 " + (it.active ? "" : "opacity-50")}>
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-sm font-medium text-primary-c truncate">{it.name}</span>
                  <span className={"text-xs shrink-0 " + (itemType(it) === "income" ? "text-emerald-500" : "text-muted-c")}>
                    {itemType(it) === "income" ? "Income · " : ""}
                    {it.category}
                  </span>
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
                      if (!window.confirm(`Delete "${it.name}"? It will stop repeating.`)) return;
                      const entries = entriesForItem(it.id);
                      if (entries.length === 0) {
                        onDelete(it.id, false);
                        return;
                      }
                      const total = entries.reduce((acc, t) => acc + Number(t.amount || 0), 0);
                      const removeEntries = window.confirm(
                        `"${it.name}" has logged ${entries.length} ${entries.length === 1 ? "entry" : "entries"} ` +
                          `(${fmt(total)} in total).\n\nOK: delete those entries too.\nCancel: keep them in your history.`
                      );
                      onDelete(it.id, removeEntries);
                    }}
                    className="p-1 text-muted-c hover:text-rose-400"
                  >
                    <IconTrash size={14} />
                  </button>
                  <ToggleSwitch checked={it.active} onChange={() => onToggleActive(it.id)} />
                </div>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-c flex items-center gap-1">
                  {it.autoLog && <IconRepeat size={11} />}
                  {describeSchedule(it)}
                  {it.countsNextMonth ? " · for next month" : ""}
                  {it.autoLog ? " · auto" : ""}
                  {it.applicable ? ` · ${fmt(it.planned)} ${itemType(it) === "income" ? "expected" : "planned"}` : " · not due this month"}
                </span>
                {it.applicable ? (
                  <div className="flex items-center gap-2">
                    <span className="text-secondary-c">
                      {itemType(it) === "income" ? "Received" : "Paid"} {fmt(it.paid)}
                    </span>
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
