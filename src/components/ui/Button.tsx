"use client";

import { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "ghost" | "destructive";
type Size = "md" | "sm" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
}

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-accent text-white shadow-accent hover:bg-accent-hover disabled:bg-control-disabled disabled:text-text-faint disabled:shadow-none",
  secondary:
    "bg-white text-text-primary border border-border-strong hover:border-accent hover:text-accent-text",
  ghost: "bg-transparent text-text-secondary hover:bg-placeholder-secondary hover:text-text-primary",
  destructive:
    "bg-white text-text-destructive border border-border-strong hover:border-text-destructive hover:bg-red-50",
};

const sizeClasses: Record<Size, string> = {
  sm: "h-9 px-3.5 text-sm rounded-full",
  md: "h-11 px-5 text-base rounded-full",
  lg: "h-[52px] px-6 text-lg rounded-full",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", fullWidth, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center gap-2 font-medium transition-all duration-150 ease-out disabled:cursor-not-allowed",
          variantClasses[variant],
          sizeClasses[size],
          fullWidth && "w-full",
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
