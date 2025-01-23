import { cn } from "@/lib/utils";
import { HTMLAttributes } from "react";

interface BadgeProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "success" | "destructive" | "outline";
}

export function Badge({
  className,
  variant = "default",
  ...props
}: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        {
          "border-transparent bg-indigo-600 text-white hover:bg-indigo-600/80": variant === "default",
          "border-transparent bg-green-600 text-white hover:bg-green-600/80": variant === "success",
          "border-transparent bg-red-600 text-white hover:bg-red-600/80": variant === "destructive",
          "border-gray-300 bg-transparent text-gray-700 hover:bg-gray-100": variant === "outline",
        },
        className
      )}
      {...props}
    />
  );
}