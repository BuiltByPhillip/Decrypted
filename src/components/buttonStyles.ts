import { twMerge } from "tailwind-merge";

export type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "ghostMuted" | "option" | "submit" | "continue" | "definition" | "category";
export type ButtonSize = "none" | "sm" | "md" | "lg";

export const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-muted text-dark hover:shadow-[0_0_10px_var(--color-muted)] transition duration-300 select-none",
  secondary:
    "bg-dark text-muted hover:shadow-[0_0_10px_var(--color-muted)] transition duration-300 select-none",
  outline:
    "bg-transparent border-2 border-muted text-muted hover:bg-muted/10",
  ghost:
    "bg-transparent text-cream hover:bg-white/10",
  ghostMuted:
    "bg-transparent text-muted hover:underline",
  option:
    "hover:brightness-90 transition duration-300 ease-in-out hover:-translate-y-1 hover:scale-103",
  submit:
    "bg-green text-green-foreground transition ease-in-out delay-100 duration-300 hover:scale-105",
  continue:
    "bg-dark text-muted border border-muted opacity-70 transition duration-300 ease-in-out hover:-translate-y-1 hover:scale-103",
  definition:
    "bg-dark hover:brightness-90 transition duration-300 ease-in-out hover:-translate-y-1 hover:scale-105",
  category:
    "bg-dark/70 border border-muted min-w-30 min-h-10 rounded-2xl text-muted",
};

export const sizeStyles: Record<ButtonSize, string> = {
  none: "",
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2 text-base",
  lg: "px-6 py-3 text-lg",
};

export function buildButtonClassName(
  variant: ButtonVariant,
  size: ButtonSize,
  fullWidth: boolean,
  className: string,
  extra: string
) {
  return twMerge(
    variantStyles[variant],
    sizeStyles[size],
    fullWidth ? "w-full" : "",
    "rounded-2xl font-medium transition-all hover:cursor-pointer text-center",
    extra,
    className
  );
}
