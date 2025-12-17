import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";
import { Button } from "./ui/button";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  const isDark = theme === "dark";

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="relative w-10 h-10 rounded-full overflow-hidden theme-toggle-btn"
      aria-label="Alternar tema"
    >
      {/* Sol */}
      <Sun 
        className={`h-5 w-5 absolute transition-all duration-500 ease-out text-yellow-500
          ${isDark ? 'rotate-90 scale-0 opacity-0' : 'rotate-0 scale-100 opacity-100'}`} 
      />
      {/* Lua */}
      <Moon 
        className={`h-5 w-5 absolute transition-all duration-500 ease-out text-primary
          ${isDark ? 'rotate-0 scale-100 opacity-100' : '-rotate-90 scale-0 opacity-0'}`}
      />
      <span className="sr-only">Alternar tema</span>
    </Button>
  );
}
