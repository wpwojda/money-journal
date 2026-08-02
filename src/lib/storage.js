import { BUDGET_CATEGORIES, OLD_CATEGORY_TO_BUDGET_CATEGORY, RECURRENCE_TYPES } from "../constants.js";
import { uid } from "./id.js";

export const STORAGE_KEY = "money-journal-data-v1";
export const BACKUP_KEY = "money-journal-backup-v1";

/**
 * Current on-disk schema version.
 *
 * Bump this whenever the persisted shape changes, and add a matching entry to
 * MIGRATIONS below. Every saved payload records the version it was written with, so
 * an old backup restored years later still upgrades cleanly instead of being
 * silently misread.
 */
export const SCHEMA_VERSION = 2;

/** Result codes returned by saveData so callers can surface real failures to the user. */
export const SAVE_OK = "ok";
export const SAVE_QUOTA_EXCEEDED = "quota-exceeded";
export const SAVE_UNAVAILABLE = "unavailable";

export function defaultData() {
  return {
    version: SCHEMA_VERSION,
    income: [],
    expenses: [],
    budgetItems: [],
    budgetCategories: [...BUDGET_CATEGORIES],
    settings: { currency: "EUR", theme: "system" },
  };
}

/**
 * Infers the schema version of a payload that predates explicit versioning.
 * v1 saves are recognisable by their `recurringTemplates` array and/or a
 * `settings.monthlyBudget` object; anything older is treated as v0.
 */
function detectVersion(parsed) {
  if (typeof parsed.version === "number") return parsed.version;
  if (Array.isArray(parsed.recurringTemplates)) return 1;
  if (parsed.settings && parsed.settings.monthlyBudget) return 1;
  return 0;
}

/**
 * Migration chain, keyed by the version being migrated FROM.
 * Each function takes a payload at version N and returns one at version N+1.
 * Keep these pure and additive - they run against real user data.
 */
const MIGRATIONS = {
  // v0 -> v1: the earliest saves only had income/expenses. Nothing to restructure;
  // later steps fill in the newer collections.
  0: (data) => ({ ...data, version: 1 }),

  // v1 -> v2: fixed-category `recurringTemplates` become first-class `budgetItems`
  // with their own name, budget category, recurrence and active flag. The old
  // `settings.monthlyBudget` (overall/per-category limits) is intentionally dropped:
  // budget items replaced that concept entirely.
  1: (data) => {
    const budgetItems = Array.isArray(data.recurringTemplates)
      ? data.recurringTemplates.map((t, i) => ({
          id: t.id || uid(),
          name: t.description || t.category || "Recurring item",
          amount: Number(t.amount) || 0,
          category: OLD_CATEGORY_TO_BUDGET_CATEGORY[t.category] || "Other",
          recurrence: "monthly",
          dueDay: t.dayOfMonth || 1,
          dueDate: null,
          notes: "",
          active: t.active !== false,
          order: i,
        }))
      : [];

    const next = { ...data, version: 2, budgetItems };
    delete next.recurringTemplates;
    if (next.settings) {
      const { monthlyBudget: _dropped, ...restSettings } = next.settings;
      next.settings = restSettings;
    }
    return next;
  },
};

/**
 * Runs a parsed payload forward through the migration chain to SCHEMA_VERSION.
 * Unknown/newer versions are passed through untouched so a file written by a future
 * build is never mangled by an older one.
 */
export function migrate(parsed) {
  let data = parsed;
  let version = detectVersion(parsed);

  while (version < SCHEMA_VERSION && MIGRATIONS[version]) {
    data = MIGRATIONS[version](data);
    version = data.version;
  }
  return data;
}

/**
 * Migrates then normalizes any parsed JSON into the current shape. Defensive against
 * missing/garbage fields so a corrupted or partial value never crashes the app.
 */
export function normalizeData(parsed) {
  const base = defaultData();
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return base;

  const migrated = migrate(parsed);

  const income = Array.isArray(migrated.income) ? migrated.income : [];
  const expenses = Array.isArray(migrated.expenses) ? migrated.expenses : [];

  const budgetItems = Array.isArray(migrated.budgetItems)
    ? migrated.budgetItems.map((it, i) => ({
        id: it.id || uid(),
        name: it.name || it.category || "Budget item",
        amount: Number(it.amount) || 0,
        category: it.category || "Other",
        recurrence: RECURRENCE_TYPES.includes(it.recurrence) ? it.recurrence : "monthly",
        dueDay: typeof it.dueDay === "number" ? it.dueDay : null,
        dueDate: it.dueDate || null,
        notes: it.notes || "",
        active: it.active !== false,
        order: typeof it.order === "number" ? it.order : i,
      }))
    : [];

  const incomingCategories = Array.isArray(migrated.budgetCategories) ? migrated.budgetCategories : [];
  const budgetCategories = Array.from(new Set([...BUDGET_CATEGORIES, ...incomingCategories]));

  return {
    version: SCHEMA_VERSION,
    income,
    expenses,
    budgetItems,
    budgetCategories,
    settings: {
      currency: (migrated.settings && migrated.settings.currency) || base.settings.currency,
      theme: (migrated.settings && migrated.settings.theme) || base.settings.theme,
    },
  };
}

/**
 * True when localStorage is actually usable. Safari private mode historically exposed the
 * API but threw on every write, so we probe with a real round-trip rather than trusting
 * the presence of the object.
 */
export function isStorageAvailable() {
  try {
    const probe = "__mj_probe__";
    localStorage.setItem(probe, "1");
    localStorage.removeItem(probe);
    return true;
  } catch {
    return false;
  }
}

function isQuotaError(err) {
  return (
    typeof DOMException !== "undefined" &&
    err instanceof DOMException &&
    (err.name === "QuotaExceededError" ||
      err.name === "NS_ERROR_DOM_QUOTA_REACHED" ||
      err.code === 22 ||
      err.code === 1014)
  );
}

/**
 * Reads, migrates and normalizes the saved app state. Never throws.
 * Falls back to the rolling backup if the primary key is corrupt, and only reports
 * `corrupted` when both the primary value and the backup are unusable.
 */
export function loadData() {
  let rawPrimary = null;
  try {
    rawPrimary = localStorage.getItem(STORAGE_KEY);
  } catch {
    // Storage unreadable entirely (privacy mode / disabled). Start clean, in-memory only.
    return { data: defaultData(), corrupted: false, recoveredFromBackup: false, storageAvailable: false };
  }

  if (!rawPrimary) {
    return {
      data: defaultData(),
      corrupted: false,
      recoveredFromBackup: false,
      storageAvailable: isStorageAvailable(),
    };
  }

  try {
    return {
      data: normalizeData(JSON.parse(rawPrimary)),
      corrupted: false,
      recoveredFromBackup: false,
      storageAvailable: true,
    };
  } catch {
    // Primary is corrupt - try the automatic backup before giving up on the user's data.
    try {
      const rawBackup = localStorage.getItem(BACKUP_KEY);
      if (rawBackup) {
        const recovered = normalizeData(JSON.parse(rawBackup));
        return { data: recovered, corrupted: false, recoveredFromBackup: true, storageAvailable: true };
      }
    } catch {
      // Backup is unusable too - fall through to a clean start.
    }
    return { data: defaultData(), corrupted: true, recoveredFromBackup: false, storageAvailable: true };
  }
}

/**
 * Persists app state and returns a status code. Callers MUST surface a non-OK result:
 * silently dropping a write in a finance app means the user believes data is saved when
 * it is not.
 *
 * Before overwriting the primary key we copy the last known-good value to a backup key,
 * so a later corruption of the primary still has a recovery point.
 */
export function saveData(data) {
  let serialized;
  try {
    serialized = JSON.stringify(data);
  } catch {
    return SAVE_UNAVAILABLE;
  }

  try {
    const previous = localStorage.getItem(STORAGE_KEY);
    if (previous && previous !== serialized) {
      try {
        localStorage.setItem(BACKUP_KEY, previous);
      } catch {
        // A failed backup write must never block the primary write - current data
        // matters more than the recovery copy.
      }
    }
    localStorage.setItem(STORAGE_KEY, serialized);
    return SAVE_OK;
  } catch (err) {
    if (isQuotaError(err)) {
      // Reclaim the backup slot and retry once - usually enough to fit the primary write.
      try {
        localStorage.removeItem(BACKUP_KEY);
        localStorage.setItem(STORAGE_KEY, serialized);
        return SAVE_OK;
      } catch {
        return SAVE_QUOTA_EXCEEDED;
      }
    }
    return SAVE_UNAVAILABLE;
  }
}

/** Reads the automatic backup, if one exists and is parseable. */
export function readBackup() {
  try {
    const raw = localStorage.getItem(BACKUP_KEY);
    if (!raw) return null;
    return normalizeData(JSON.parse(raw));
  } catch {
    return null;
  }
}

/** Whether an automatic backup currently exists (used to enable the restore button). */
export function hasBackup() {
  try {
    return !!localStorage.getItem(BACKUP_KEY);
  } catch {
    return false;
  }
}

/** Triggers a browser download of the given data as a formatted JSON file. */
export function downloadJSON(data, filename) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Validates a parsed backup file before it is allowed to replace live data.
 * Returns { ok: true } or { ok: false, reason } - never throws.
 */
export function validateImport(parsed) {
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    return { ok: false, reason: "That file isn't a Money Journal backup." };
  }
  if (!Array.isArray(parsed.income) && !Array.isArray(parsed.expenses)) {
    return { ok: false, reason: "That backup has no income or expense records in it." };
  }
  if (typeof parsed.version === "number" && parsed.version > SCHEMA_VERSION) {
    return {
      ok: false,
      reason: "That backup was made by a newer version of Money Journal. Update the app first.",
    };
  }
  const entries = [...(parsed.income || []), ...(parsed.expenses || [])];
  const bad = entries.find((e) => e && e.date != null && typeof e.date !== "string");
  if (bad) {
    return { ok: false, reason: "That backup contains malformed dates and can't be imported safely." };
  }
  return { ok: true };
}
