import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "./ui/button";

export function ThemeToggle() {
  const { setTheme, theme } = useTheme();

  return (
    <Button
      variant="outline"
      size="icon"
      // Custom hover logic using Tailwind:
      // In dark mode: hover:bg-white hover:text-black
      // In light mode: hover:bg-black hover:text-white
      className="rounded-full w-12 h-12 bg-background border-border transition-all duration-300 shadow-xl 
                 dark:hover:bg-white dark:hover:text-black 
                 hover:bg-black hover:text-white group"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
    >
      <div className="relative w-6 h-6 flex items-center justify-center">
        <Sun className="h-6 w-6 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
        <Moon className="absolute h-6 w-6 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      </div>
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
