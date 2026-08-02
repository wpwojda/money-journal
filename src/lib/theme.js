/** Applies the resolved light/dark class to <html> based on the stored theme preference. */
export function applyTheme(theme) {
  const isDark =
    theme === "dark" ||
    (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.classList.toggle("dark", isDark);
}
