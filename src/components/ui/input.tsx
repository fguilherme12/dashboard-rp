"use client";

import { cn } from "@/lib/utils";
import { type InputHTMLAttributes, forwardRef } from "react";

export const Input = forwardRef<
  HTMLInputElement,
  InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => (
  <input
    ref={ref}
    className={cn(
      "w-full rounded-lg border border-card-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted focus:border-accent-green/50 focus:outline-none focus:ring-1 focus:ring-accent-green/30",
      className
    )}
    {...props}
  />
));
Input.displayName = "Input";
