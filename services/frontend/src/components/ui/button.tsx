"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
  size?: "default" | "sm" | "lg" | "icon";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "default",
      size = "default",
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap rounded-2xl text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
          {
            "bg-primary text-primary-foreground shadow-lg hover:opacity-90":
              variant === "default",

            "bg-destructive text-destructive-foreground shadow-lg hover:opacity-90":
              variant === "destructive",

            "border border-border bg-background hover:bg-accent hover:text-accent-foreground":
              variant === "outline",

            "bg-secondary text-secondary-foreground hover:bg-secondary/80":
              variant === "secondary",

            "hover:bg-accent hover:text-accent-foreground":
              variant === "ghost",

            "text-primary underline-offset-4 hover:underline":
              variant === "link",

            "h-11 px-5": size === "default",

            "h-9 px-4 text-xs": size === "sm",

            "h-12 px-8 text-base": size === "lg",

            "h-11 w-11": size === "icon",
          },
          className
        )}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";

export { Button };