import type { ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "outline" | "outlineLight" | "ghost";

interface ButtonProps {
  children: ReactNode;
  variant?: ButtonVariant;
  href?: string;
  onClick?: () => void;
  className?: string;
  type?: "button" | "submit";
  disabled?: boolean;
}

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-forest text-cream hover:bg-forest-light shadow-lg shadow-forest/20 hover:shadow-xl hover:shadow-forest/30",
  secondary:
    "bg-saffron text-forest-dark hover:bg-saffron-light shadow-lg shadow-saffron/30",
  outline:
    "border-2 border-forest text-forest hover:bg-forest hover:text-cream",
  outlineLight:
    "border-2 border-cream/90 bg-cream/10 text-cream shadow-lg shadow-black/20 backdrop-blur-sm hover:border-cream hover:bg-cream hover:text-forest",
  ghost: "text-forest hover:bg-forest/5",
};

export function Button({
  children,
  variant = "primary",
  href,
  onClick,
  className = "",
  type = "button",
  disabled = false,
}: ButtonProps) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold tracking-wide transition-all duration-300 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50";

  const classes = `${base} ${variants[variant]} ${className}`;

  if (href && !disabled) {
    return (
      <a href={href} className={classes}>
        {children}
      </a>
    );
  }

  return (
    <button type={type} onClick={onClick} className={classes} disabled={disabled}>
      {children}
    </button>
  );
}
