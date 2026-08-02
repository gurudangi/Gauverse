import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { api } from "../../lib/api";
import { useToast } from "../../contexts/ToastContext";
import { Button } from "../../components/ui/Button";

export interface FarmCowOption {
  id: string;
  name: string;
  breed: string;
  status: string;
  milkYieldLabel: string;
  availableForAdoption: boolean;
  description: string;
}

export function useFarmCows() {
  const { showToast } = useToast();
  const [cows, setCows] = useState<FarmCowOption[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .getFarmCows()
      .then((res) => setCows(res.data ?? []))
      .catch((err) =>
        showToast(err instanceof Error ? err.message : "Could not load cows", "error"),
      )
      .finally(() => setLoading(false));
  }, [showToast]);

  return { cows, loading, setCows };
}

export function FarmFormShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-semibold text-forest">{title}</h1>
        <p className="mt-2 text-sm text-muted">{subtitle}</p>
      </div>
      {children}
    </div>
  );
}

export function CowSelect({
  cows,
  value,
  onChange,
  id = "cowId",
}: {
  cows: FarmCowOption[];
  value: string;
  onChange: (id: string) => void;
  id?: string;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-forest">
        Cow
      </label>
      <select
        id={id}
        required
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-forest/15 bg-white px-4 py-3 text-sm text-forest outline-none focus:border-forest"
      >
        <option value="">Select cow</option>
        {cows.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name} ({c.breed})
          </option>
        ))}
      </select>
    </div>
  );
}

export function NotesField({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label htmlFor="notes" className="mb-1.5 block text-sm font-medium text-forest">
        Notes
      </label>
      <textarea
        id="notes"
        rows={2}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-forest/15 bg-white px-4 py-3 text-sm text-forest outline-none focus:border-forest"
      />
    </div>
  );
}

export function RecordList({
  loading,
  empty,
  children,
}: {
  loading: boolean;
  empty: boolean;
  children: ReactNode;
}) {
  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-7 w-7 animate-spin text-forest" />
      </div>
    );
  }
  if (empty) {
    return (
      <div className="rounded-3xl border border-dashed border-forest/20 bg-cream p-8 text-center text-muted">
        No records yet.
      </div>
    );
  }
  return <ul className="space-y-3">{children}</ul>;
}

export function SubmitBar({
  loading,
  label,
}: {
  loading: boolean;
  label: string;
}) {
  return (
    <Button type="submit" disabled={loading}>
      {loading ? "Saving…" : label}
    </Button>
  );
}

export type FormSubmit = (e: FormEvent) => Promise<void>;
