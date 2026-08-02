import { Link } from "react-router-dom";

export function AccountComingSoon({ title }: { title: string }) {
  return (
    <div className="rounded-3xl border border-dashed border-forest/20 bg-cream p-10 text-center">
      <h1 className="font-display text-3xl font-semibold text-forest">{title}</h1>
      <p className="mx-auto mt-3 max-w-md text-muted">
        This section is part of the upcoming GauVerse customer portal roadmap.
      </p>
      <Link to="/account" className="mt-6 inline-block text-sm font-semibold text-forest hover:underline">
        ← Back to dashboard
      </Link>
    </div>
  );
}
