"use client";

import { cn } from "@/lib/utils";
import { type SelectHTMLAttributes, forwardRef } from "react";

export const Select = forwardRef<
  HTMLSelectElement,
  SelectHTMLAttributes<HTMLSelectElement>
>(({ className, children, ...props }, ref) => (
  <select
    ref={ref}
    className={cn(
      "w-full rounded-lg border border-card-border bg-background px-3 py-2 text-sm text-foreground focus:border-accent-green/50 focus:outline-none focus:ring-1 focus:ring-accent-green/30 appearance-none cursor-pointer",
      className
    )}
    {...props}
  >
    {children}
  </select>
));
Select.displayName = "Select";
