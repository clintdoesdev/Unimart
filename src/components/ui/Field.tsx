"use client";

import {
  InputHTMLAttributes,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
  forwardRef,
} from "react";
import { cn } from "@/lib/cn";

const baseFieldClasses =
  "w-full border bg-bg px-4 text-base text-text-primary placeholder:text-text-secondary outline-none transition-all duration-150 focus:border-accent focus:bg-white focus:ring-4 focus:ring-accent/10";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, ...props }, ref) => (
    <div className="w-full">
      <input
        ref={ref}
        className={cn(
          baseFieldClasses,
          "h-12 rounded-full",
          error ? "border-text-destructive" : "border-border-input",
          className
        )}
        {...props}
      />
      {error && <p className="mt-1.5 text-sm text-text-destructive">{error}</p>}
    </div>
  )
);
Input.displayName = "Input";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, ...props }, ref) => (
    <div className="w-full">
      <textarea
        ref={ref}
        className={cn(
          baseFieldClasses,
          "min-h-[100px] rounded-[28px] py-3.5 resize-none",
          error ? "border-text-destructive" : "border-border-input",
          className
        )}
        {...props}
      />
      {error && <p className="mt-1.5 text-sm text-text-destructive">{error}</p>}
    </div>
  )
);
Textarea.displayName = "Textarea";

type SelectProps = SelectHTMLAttributes<HTMLSelectElement>;

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, ...props }, ref) => (
    <select
      ref={ref}
      className={cn(baseFieldClasses, "h-12 rounded-full border-border-input appearance-none", className)}
      {...props}
    >
      {children}
    </select>
  )
);
Select.displayName = "Select";

export function Label({ children }: { children: React.ReactNode }) {
  return <label className="label-mono mb-1.5 block text-[11px] text-text-label">{children}</label>;
}
