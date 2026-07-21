import type { ButtonHTMLAttributes } from "react";
import Link from "next/link";

type ButtonVariant = "primary" | "outline" | "outline-neutral" | "ghost" | "google" | "soft";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  href?: string;
  pill?: boolean;
}

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary: "bg-indigo-600 text-white hover:bg-indigo-700",
  outline: "border border-indigo-600 text-indigo-600 hover:bg-indigo-50",
  "outline-neutral":
    "border border-gray-300 text-black/70 hover:border-indigo-600 hover:text-indigo-600",
  ghost: "text-gray-700 hover:bg-gray-100",
  google: "border border-gray-200 text-gray-700 hover:bg-gray-50",
  soft: "border border-indigo-600 bg-indigo-50 text-indigo-600",
};

export function Button({
  variant = "primary",
  className = "",
  href,
  pill = false,
  children,
  ...props
}: ButtonProps) {
  const shapeClasses = pill
    ? "rounded-full px-4 py-1.5"
    : "min-w-[110px] rounded-lg px-6 py-[7px]";
  const classes = `inline-flex items-center justify-center ${shapeClasses} text-xs font-semibold transition-colors ${VARIANT_CLASSES[variant]} ${className}`;

  if (href) {
    const isExternal = href.startsWith("mailto:") || href.startsWith("http");

    if (isExternal) {
      return (
        <a
          href={href}
          className={classes}
          target={href.startsWith("http") ? "_blank" : undefined}
          rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
        >
          {children}
        </a>
      );
    }

    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button type="button" className={classes} {...props}>
      {children}
    </button>
  );
}
