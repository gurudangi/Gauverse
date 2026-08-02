import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { api } from "../../lib/api";
import { useToast } from "../../contexts/ToastContext";

type Row = Record<string, string | number | boolean | string[] | undefined>;

export function AdminTablePage({
  title,
  load,
  columns,
}: {
  title: string;
  load: () => Promise<{ data?: Row[] }>;
  columns: { key: string; label: string }[];
}) {
  const { showToast } = useToast();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load()
      .then((res) => setRows(res.data ?? []))
      .catch((err) =>
        showToast(err instanceof Error ? err.message : `Could not load ${title}`, "error"),
      )
      .finally(() => setLoading(false));
  }, [load, showToast, title]);

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl font-semibold text-forest">{title}</h1>
      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-7 w-7 animate-spin text-forest" />
        </div>
      ) : rows.length === 0 ? (
        <p className="text-muted">No records yet.</p>
      ) : (
        <div className="overflow-x-auto rounded-3xl border border-forest/10 bg-cream shadow-sm">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-forest/10 bg-forest/5 text-xs uppercase tracking-wide text-muted">
              <tr>
                {columns.map((c) => (
                  <th key={c.key} className="px-4 py-3 font-semibold">
                    {c.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, idx) => (
                <tr key={String(row.id ?? idx)} className="border-b border-forest/5">
                  {columns.map((c) => {
                    const value = row[c.key];
                    const display = Array.isArray(value)
                      ? value.join(", ")
                      : value === undefined || value === null
                        ? "—"
                        : String(value);
                    return (
                      <td key={c.key} className="max-w-[14rem] truncate px-4 py-3 text-forest">
                        {display}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
