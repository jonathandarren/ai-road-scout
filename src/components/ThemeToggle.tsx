import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";

export const ThemeToggle = () => {
  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    const stored = localStorage.getItem("theme");
    if (stored) return stored === "dark";
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", isDark);
    localStorage.setItem("theme", isDark ? "dark" : "light");
  }, [isDark]);

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isDark}
      aria-label="Toggle dark mode"
      onClick={() => setIsDark((v) => !v)}
      className={cn(
        "relative inline-flex h-8 w-16 shrink-0 cursor-pointer items-center rounded-full border-2 transition-colors",
        isDark
          ? "border-primary/40 bg-secondary"
          : "border-primary/60 bg-primary/20"
      )}
    >
      <span
        className={cn(
          "pointer-events-none inline-flex h-6 w-6 transform items-center justify-center rounded-full bg-primary text-secondary shadow-warm transition-transform duration-300",
          isDark ? "translate-x-8" : "translate-x-1"
        )}
      >
        {isDark ? <Moon className="h-3.5 w-3.5" /> : <Sun className="h-3.5 w-3.5" />}
      </span>
      <Sun
        className={cn(
          "absolute left-1.5 h-3.5 w-3.5 transition-opacity",
          isDark ? "opacity-40 text-secondary-foreground/60" : "opacity-0"
        )}
      />
      <Moon
        className={cn(
          "absolute right-1.5 h-3.5 w-3.5 transition-opacity",
          isDark ? "opacity-0" : "opacity-40 text-secondary/60"
        )}
      />
    </button>
  );
};
