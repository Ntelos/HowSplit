
"use client";

import * as React from "react";
import { Moon, Sun, Laptop } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";

export function ThemeToggle() {
  const { setTheme, theme } = useTheme();

  return (
    <div className="flex flex-col space-y-2">
      <Label htmlFor="theme-toggle-trigger">Theme</Label>
      <DropdownMenu>
        <DropdownMenuTrigger asChild id="theme-toggle-trigger">
          <Button variant="outline" className="w-full justify-start">
            {theme === "light" && <Sun className="mr-2 h-4 w-4" />}
            {theme === "dark" && <Moon className="mr-2 h-4 w-4" />}
            {theme === "system" && <Laptop className="mr-2 h-4 w-4" />}
            {theme?.charAt(0).toUpperCase() + (theme?.slice(1) ?? 'System')}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuItem onClick={() => setTheme("light")}>
            <Sun className="mr-2 h-4 w-4" />
            Light
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setTheme("dark")}>
            <Moon className="mr-2 h-4 w-4" />
            Dark
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setTheme("system")}>
            <Laptop className="mr-2 h-4 w-4" />
            System
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
