"use client";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { IconSun, IconMoon } from "@tabler/icons-react";

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="px-4 py-2 rounded  text-black dark:text-white"
    >
      <span
        className={
          `relative w-14 h-8 flex items-center rounded-full transition-colors duration-300 ` +
          (theme === "dark" ? "bg-gray-700" : "bg-yellow-200")
        }
        aria-label="Toggle theme"
      >
        <span
          className={
            `absolute left-1 top-1 w-6 h-6 flex items-center justify-center rounded-full transition-transform duration-300 ` +
            (theme === "dark"
              ? "translate-x-6 bg-gray-900"
              : "translate-x-0 bg-white")
          }
        >
          {theme === "dark" ? (
            <IconMoon size={20} className="text-white" />
          ) : (
            <IconSun size={20} className="text-yellow-500" />
          )}
        </span>
      </span>
    </button>
  );
}
