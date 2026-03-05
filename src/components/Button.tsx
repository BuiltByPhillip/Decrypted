"use client";

import { forwardRef, type ButtonHTMLAttributes } from "react";
import { twMerge } from "tailwind-merge";

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "option" | "submit" | "definition" | "category";
type ButtonSize = "none" | "sm" | "md" | "lg";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
};

const variantStyles: Record<ButtonVariant, string> = {
  primary: "bg-cream text-white hover:brightness-110",
  secondary: "bg-medium text-white hover:brightness-125",
  outline: "bg-transparent border-2 border-cream text-cream hover:bg-cream/20",
  ghost: "bg-transparent text-cream hover:bg-white/10",
  option: "hover:brightness-90 transition duration-300 ease-in-out hover:-translate-y-1 hover:scale-103",
  submit: "bg-green text-green-foreground transition ease-in-out delay-100 duration-300 hover:scale-105",
  definition: "bg-dark hover:brightness-90 transition duration-300 ease-in-out hover:-translate-y-1 hover:scale-105",
  category: "bg-dark/70 border border-muted min-w-30 min-h-10 rounded-2xl text-muted",
};

const sizeStyles: Record<ButtonSize, string> = {
  none: "",
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2 text-base",
  lg: "px-6 py-3 text-lg",
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", fullWidth = false, className = "", children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={twMerge(
          variantStyles[variant],
          sizeStyles[size],
          fullWidth ? "w-full" : "",
          "rounded-2xl font-medium transition-all hover:cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed text-center",
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

export default Button;
