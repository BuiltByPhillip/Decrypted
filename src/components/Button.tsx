"use client";

import { forwardRef, type ButtonHTMLAttributes } from "react";
import { type ButtonVariant, type ButtonSize, buildButtonClassName } from "~/components/buttonStyles";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", fullWidth = false, className = "", children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={buildButtonClassName(variant, size, fullWidth, className, "disabled:opacity-50 disabled:cursor-not-allowed")}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

export default Button;
