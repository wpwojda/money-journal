import { createContext, useContext } from "react";

export const SettingsContext = createContext(null);

/** Access { settings, formatCurrency, updateSettings } from anywhere below <App />. */
export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) {
    throw new Error("useSettings must be called within a SettingsContext.Provider");
  }
  return ctx;
}
