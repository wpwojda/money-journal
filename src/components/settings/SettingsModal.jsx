import { useRef, useState } from "react";
import { CURRENCIES } from "../../constants.js";
import { downloadJSON, validateImport, readBackup, hasBackup } from "../../lib/storage.js";
import { todayISO } from "../../lib/dateUtils.js";
import { Modal } from "../common/Modal.jsx";
import { FormField } from "../common/FormField.jsx";
import { IconDownload, IconUpload, IconRepeat } from "../common/Icons.jsx";

export function SettingsModal({ onClose, settings, onUpdateSettings, fullData, onImport, onClearAll }) {
  const [tab, setTab] = useState("general");
  const [status, setStatus] = useState(null); // { kind: "error" | "success", message }
  const [confirming, setConfirming] = useState(null); // "import" | "restore" | "clear"
  const [pendingImport, setPendingImport] = useState(null);
  const fileInputRef = useRef(null);
  const backupAvailable = hasBackup();

  function handleExport() {
    downloadJSON(fullData, `money-journal-backup-${todayISO()}.json`);
    setStatus({ kind: "success", message: "Backup downloaded." });
  }

  function handleFile(e) {
    const file = e.target.files[0];
    e.target.value = "";
    if (!file) return;

    const reader = new FileReader();
    reader.onerror = () => setStatus({ kind: "error", message: "That file couldn't be read." });
    reader.onload = () => {
      let parsed;
      try {
        parsed = JSON.parse(reader.result);
      } catch {
        setStatus({ kind: "error", message: "That file isn't valid JSON." });
        return;
      }
      const result = validateImport(parsed);
      if (!result.ok) {
        setStatus({ kind: "error", message: result.reason });
        return;
      }
      setStatus(null);
      setPendingImport(parsed);
      setConfirming("import");
    };
    reader.readAsText(file);
  }

  function confirmImport() {
    onImport(pendingImport);
    setPendingImport(null);
    setConfirming(null);
    onClose();
  }

  function confirmRestore() {
    const backup = readBackup();
    setConfirming(null);
    if (!backup) {
      setStatus({ kind: "error", message: "The automatic backup couldn't be read." });
      return;
    }
    onImport(backup);
    onClose();
  }

  const tabs = [
    { id: "general", label: "General" },
    { id: "data", label: "Data" },
  ];

  const confirmCopy = {
    import: {
      title: "Replace all current data?",
      body: "Importing this backup will overwrite every income entry, expense, and budget item currently in the app. Your current data is copied to the automatic backup slot first.",
      action: "Import and replace",
      onConfirm: confirmImport,
      danger: false,
    },
    restore: {
      title: "Restore the automatic backup?",
      body: "This replaces your current data with the last automatically saved snapshot. Export a copy first if you're unsure.",
      action: "Restore backup",
      onConfirm: confirmRestore,
      danger: false,
    },
    clear: {
      title: "Delete everything?",
      body: "This permanently removes all income, expenses, and budget items from this device. It cannot be undone.",
      action: "Delete all data",
      onConfirm: () => {
        onClearAll();
        setConfirming(null);
        onClose();
      },
      danger: true,
    },
  };

  if (confirming) {
    const c = confirmCopy[confirming];
    return (
      <Modal title={c.title} onClose={() => setConfirming(null)}>
        <p className="text-sm text-secondary-c leading-relaxed mb-5">{c.body}</p>
        <div className="flex gap-2">
          <button
            onClick={() => {
              setConfirming(null);
              setPendingImport(null);
            }}
            className="btn-ghost flex-1 py-2.5 text-sm"
          >
            Cancel
          </button>
          <button
            onClick={c.onConfirm}
            className={
              c.danger
                ? "flex-1 py-2.5 rounded-xl text-sm font-medium text-white bg-rose-500 hover:bg-rose-400 transition-colors"
                : "btn-primary flex-1 py-2.5 text-sm"
            }
          >
            {c.action}
          </button>
        </div>
      </Modal>
    );
  }

  return (
    <Modal title="Settings" onClose={onClose}>
      <div className="flex gap-1 mb-5">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => {
              setTab(t.id);
              setStatus(null);
            }}
            className={"px-3 py-1.5 rounded-lg text-sm font-medium " + (tab === t.id ? "btn-primary" : "btn-ghost")}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "general" && (
        <div className="space-y-4">
          <FormField label="Currency">
            <select
              value={settings.currency}
              onChange={(e) => onUpdateSettings({ currency: e.target.value })}
              className="input-field"
            >
              {CURRENCIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </FormField>
          <FormField label="Theme">
            <div className="flex gap-2">
              {["light", "dark", "system"].map((th) => (
                <button
                  key={th}
                  onClick={() => onUpdateSettings({ theme: th })}
                  className={
                    "flex-1 py-2 rounded-xl text-sm font-medium capitalize border-soft border " +
                    (settings.theme === th ? "btn-primary" : "btn-ghost")
                  }
                >
                  {th}
                </button>
              ))}
            </div>
          </FormField>
        </div>
      )}

      {tab === "data" && (
        <div className="space-y-3">
          <button onClick={handleExport} className="btn-ghost w-full py-2.5 flex items-center justify-center gap-2 text-sm">
            <IconDownload size={15} /> Export backup (JSON)
          </button>
          <button
            onClick={() => fileInputRef.current && fileInputRef.current.click()}
            className="btn-ghost w-full py-2.5 flex items-center justify-center gap-2 text-sm"
          >
            <IconUpload size={15} /> Import backup (JSON)
          </button>
          <input ref={fileInputRef} type="file" accept="application/json" className="hidden" onChange={handleFile} />

          <button
            onClick={() => setConfirming("restore")}
            disabled={!backupAvailable}
            className="btn-ghost w-full py-2.5 flex items-center justify-center gap-2 text-sm disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <IconRepeat size={15} /> Restore automatic backup
          </button>
          <p className="text-xs text-muted-c px-1">
            {backupAvailable
              ? "Money Journal keeps a snapshot of your previous save on this device, in case the current one is ever damaged."
              : "No automatic backup yet - one is created the first time your data changes."}
          </p>

          {status && (
            <p className={"text-xs px-1 " + (status.kind === "error" ? "text-rose-400" : "text-emerald-500")}>
              {status.message}
            </p>
          )}

          <button
            onClick={() => setConfirming("clear")}
            className="w-full py-2.5 rounded-xl text-sm font-medium text-rose-400 border border-rose-400/30 hover:bg-rose-400/10 transition-colors"
          >
            Clear all data
          </button>
        </div>
      )}
    </Modal>
  );
}
