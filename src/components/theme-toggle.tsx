"use client";

import { useTheme } from "./theme-provider";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex items-center gap-1 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 p-0.5">
      <button
        onClick={() => setTheme("light")}
        className={`rounded-md px-2 py-1 text-xs transition-colors ${
          theme === "light"
            ? "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300"
            : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        }`}
        title="Light mode"
      >
        Sun
      </button>
      <button
        onClick={() => setTheme("dark")}
        className={`rounded-md px-2 py-1 text-xs transition-colors ${
          theme === "dark"
            ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300"
            : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        }`}
        title="Dark mode"
      >
        Moon
      </button>
      <button
        onClick={() => setTheme("system")}
        className={`rounded-md px-2 py-1 text-xs transition-colors ${
          theme === "system"
            ? "bg-gray-200 text-gray-700 dark:bg-gray-600 dark:text-gray-200"
            : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        }`}
        title="System default"
      >
        Auto
      </button>
    </div>
  );
}
