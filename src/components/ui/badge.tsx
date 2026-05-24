import { cn } from "@/lib/utils";
import { type HTMLAttributes } from "react";

export function Badge({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium border",
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
