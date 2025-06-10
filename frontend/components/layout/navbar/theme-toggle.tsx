"use client"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  
  return (
    <Button
      variant="ghost"
      size="icon"
      className="relative group"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
    >
      <span className="absolute inset-0 rounded-full bg-primary/10 scale-0 transition-transform duration-200 group-hover:scale-100"></span>
      
      {/* Sun icon - visible in light mode */}
      <Sun 
        className={`h-5 w-5 absolute transition-all duration-200 group-hover:scale-110 ${
          theme === "light" 
            ? "rotate-0 scale-100 opacity-100" 
            : "rotate-90 scale-0 opacity-0"
        }`} 
      />
      
      {/* Moon icon - visible in dark mode */}
      <Moon 
        className={`h-5 w-5 absolute transition-all duration-200 group-hover:scale-110 ${
          theme === "dark" 
            ? "rotate-0 scale-100 opacity-100" 
            : "-rotate-90 scale-0 opacity-0"
        }`} 
      />
      
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}