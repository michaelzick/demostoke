
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Moon, Sun, Laptop } from "lucide-react";
import useTheme from "@/contexts/useTheme";
import { useLayoutEffect, useState } from 'react';

const ThemeSwitcher = () => {
  const { theme, setTheme } = useTheme();

  const [visualTheme, setVisualTheme] = useState<'light' | 'dark' | 'system' | null>(null);

  useLayoutEffect(() => {
    try {
      const de = document.documentElement;
      if (de.classList.contains('system')) setVisualTheme('system');
      else if (de.classList.contains('dark')) setVisualTheme('dark');
      else if (de.classList.contains('light')) setVisualTheme('light');
      else setVisualTheme(theme);
    } catch {
      setVisualTheme(theme);
    }
    // run once to capture pre-hydration classes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const displayTheme = visualTheme ?? theme;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Toggle theme">
          {displayTheme === "dark" ? <Moon className="h-5 w-5" /> : displayTheme === "light" ? <Sun className="h-5 w-5" /> : <Laptop className="h-5 w-5" />}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => { setTheme("light"); setVisualTheme('light'); }}> <Sun className="mr-2 h-4 w-4" /> Light </DropdownMenuItem>
        <DropdownMenuItem onClick={() => { setTheme("dark"); setVisualTheme('dark'); }}> <Moon className="mr-2 h-4 w-4" /> Dark </DropdownMenuItem>
        <DropdownMenuItem onClick={() => { setTheme("system"); setVisualTheme('system'); }}> <Laptop className="mr-2 h-4 w-4" /> System </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ThemeSwitcher;
