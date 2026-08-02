interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  align?: "left" | "center";
  light?: boolean;
}

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = "center",
  light = false,
}: SectionHeadingProps) {
  const alignClass = align === "center" ? "text-center mx-auto" : "text-left";

  return (
    <div className={`mb-14 max-w-3xl ${alignClass}`}>
      {eyebrow && (
        <span
          className={`mb-3 inline-block text-sm font-semibold uppercase tracking-[0.2em] ${
            light ? "text-saffron-light" : "text-saffron"
          }`}
        >
          {eyebrow}
        </span>
      )}
      <h2
        className={`font-display text-4xl font-semibold leading-tight sm:text-5xl lg:text-[3.25rem] ${
          light ? "text-cream" : "text-forest"
        }`}
      >
        {title}
      </h2>
      {subtitle && (
        <p
          className={`mt-4 text-lg leading-relaxed ${
            light ? "text-cream/80" : "text-muted"
          }`}
        >
          {subtitle}
        </p>
      )}
      <div
        className={`mt-6 h-1 w-16 rounded-full bg-gradient-to-r from-saffron to-earth ${
          align === "center" ? "mx-auto" : ""
        }`}
      />
    </div>
  );
}
