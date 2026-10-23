"use client";

import { useSyncExternalStore, useCallback } from "react";

export type Theme = "dark" | "light";

export const THEME_STORAGE_KEY = "unloop_theme";

/**
 * Subscribes to custom theme events and cross-tab storage changes
 */
function subscribeTheme(callback: () => void): () => void {
  if (typeof window === "undefined") return () => {};

  window.addEventListener("unloop-theme-change", callback);
  window.addEventListener("storage", callback);

  return () => {
    window.removeEventListener("unloop-theme-change", callback);
    window.removeEventListener("storage", callback);
  };
}

/**
 * Reads theme state from localStorage or documentElement
 */
function getThemeSnapshot(): Theme {
  if (typeof window === "undefined") return "dark";
  try {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    if (saved === "light" || saved === "dark") {
      return saved;
    }
    if (document.documentElement.classList.contains("light")) {
      return "light";
    }
  } catch {
    // Ignore storage errors
  }
  return "dark";
}

/**
 * Default snapshot for SSR
 */
function getServerSnapshot(): Theme {
  return "dark";
}

/**
 * Apply theme to document element and persist in localStorage
 */
export function applyTheme(theme: Theme) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  if (theme === "light") {
    root.classList.remove("dark");
    root.classList.add("light");
  } else {
    root.classList.add("dark");
    root.classList.remove("light");
  }

  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // Ignore storage errors
  }

  // Notify any other listeners in the window
  window.dispatchEvent(new CustomEvent("unloop-theme-change", { detail: theme }));
}

/**
 * React hook using useSyncExternalStore for reactive theme state without cascading renders
 */
export function useTheme() {
  const theme = useSyncExternalStore(
    subscribeTheme,
    getThemeSnapshot,
    getServerSnapshot
  );

  const toggleTheme = useCallback(() => {
    const nextTheme: Theme = theme === "dark" ? "light" : "dark";
    applyTheme(nextTheme);
  }, [theme]);

  return {
    theme,
    toggleTheme,
    mounted: true,
  };
}
