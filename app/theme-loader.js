// theme-loader.js
// Dynamically sets data-theme on <html> based on THEME env variable at build time

export function applyTheme() {
  // THEME env variable is injected at build time via process.env.NEXT_PUBLIC_THEME
  const theme = process.env.NEXT_PUBLIC_THEME || "1";
  if (typeof document !== "undefined") {
    document.documentElement.setAttribute("data-theme", theme);
  }
}

// Auto-apply theme on load
if (typeof window !== "undefined") {
  applyTheme();
}
