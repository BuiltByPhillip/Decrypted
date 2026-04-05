import Link from "next/link";
import { type ButtonVariant, type ButtonSize, buildButtonClassName } from "~/components/buttonStyles";

type ButtonLinkProps = {
  href: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  className?: string;
  children: React.ReactNode;
};

export default function ButtonLink({
  href,
  variant = "primary",
  size = "md",
  fullWidth = false,
  className = "",
  children,
}: ButtonLinkProps) {
  return (
    <Link
      href={href}
      className={buildButtonClassName(variant, size, fullWidth, className, "inline-block")}
    >
      {children}
    </Link>
  );
}
