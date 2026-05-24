"use client";

import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";
import { type SelectHTMLAttributes, forwardRef } from "react";

export const Select = forwardRef<
  HTMLSelectElement,
  SelectHTMLAttributes<HTMLSelectElement>
>(({ className, children, ...props }, ref) => (
  <div className="relative">
    <select
      ref={ref}
      className={cn(
        "w-full rounded-lg border border-card-border bg-background py-2 pl-3 pr-8 text-sm text-foreground focus:border-accent-green/50 focus:outline-none focus:ring-1 focus:ring-accent-green/30 appearance-none cursor-pointer",
        className
      )}
      {...props}
    >
      {children}
    </select>
    <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
  </div>
));
Select.displayName = "Select";
