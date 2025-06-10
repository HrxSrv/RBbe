"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { forwardRef } from "react"
import type { ButtonProps } from "@/components/ui/button"

interface CustomButtonProps extends ButtonProps {
  children: React.ReactNode
  className?: string
}

const CustomButton = forwardRef<HTMLButtonElement, CustomButtonProps>(({ children, className, ...props }, ref) => {
  return (
    <Button
      ref={ref}
      className={cn(
        // Base styles
        "relative overflow-hidden font-medium transition-all duration-300 ease-in-out",
        "transform active:scale-95",

        // Light mode styles
        "bg-white text-gray-900 border border-gray-200 shadow-sm",
        "hover:bg-gray-50 hover:border-gray-300 hover:shadow-md",
        "focus:ring-2 focus:ring-gray-200 focus:ring-offset-2",

        // Dark mode styles
        "dark:bg-[#2f2f2f] dark:text-white dark:border-gray-600",
        "dark:hover:bg-[#3a3a3a] dark:hover:border-gray-500 dark:hover:shadow-lg",
        "dark:focus:ring-gray-600 dark:focus:ring-offset-gray-900",

        // Responsive sizing
        "px-4 py-2 text-sm sm:px-6 sm:py-3 sm:text-base",
        "min-h-[40px] sm:min-h-[44px]",

        // Disabled state
        "disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none",
        "disabled:hover:bg-white disabled:hover:border-gray-200 disabled:hover:shadow-sm",
        "dark:disabled:hover:bg-[#2f2f2f] dark:disabled:hover:border-gray-600",

        className,
      )}
      {...props}
    >
      {/* Shimmer effect on hover */}
      <span className="absolute inset-0 -top-[40px] -left-[40px] bg-gradient-to-r from-transparent via-white/20 to-transparent rotate-45 w-6 h-full transition-all duration-700 ease-out opacity-0 group-hover:opacity-100 group-hover:left-[100%]" />

      {/* Button content */}
      <span className="relative z-10 flex items-center justify-center gap-2">{children}</span>
    </Button>
  )
})

CustomButton.displayName = "CustomButton"

export { CustomButton }
