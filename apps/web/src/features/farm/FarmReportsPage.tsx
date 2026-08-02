import { useEffect, useState, type FormEvent } from "react";
import { api } from "../../lib/api";
import { useToast } from "../../contexts/ToastContext";
import { FarmFormShell, RecordList, SubmitBar } from "./farmUi";

interface ReportRow {
  id: string;
  reportDate: string;
  summary: string;
  cowsChecked: number;
  milkTotalLitres: number;
  issues: string;
  recordedByName: string;
  createdAt: string;
}

function todayYmd() {
  return new Date().toISOString().slice(0, 10);
}

export function FarmReportsPage() {
  const { showToast } = useToast();
  const [rows, setRows] = useState<ReportRow[]>([]);
  const [listLoading, setListLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [reportDate, setReportDate] = useState(todayYmd());
  const [summary, setSummary] = useState("");
  const [cowsChecked, setCowsChecked] = useState("0");
  const [milkTotalLitres, setMilkTotalLitres] = useState("0");
  const [issues, setIssues] = useState("");

  const reload = async () => {
    const res = await api.getFarmReports();
    setRows(res.data ?? []);
  };

  useEffect(() => {
    reload()
      .catch((err) =>
        showToast(err instanceof Error ? err.message : "Could not load reports", "error"),
      )
      .finally(() => setListLoading(false));
  }, [showToast]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.createFarmReport({
        reportDate,
        summary,
        cowsChecked: Number(cowsChecked),
        milkTotalLitres: Number(milkTotalLitres),
        issues,
      });
      showToast("Daily report submitted");
      setSummary("");
      setIssues("");
      await reload();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Could not save", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <FarmFormShell
      title="Daily reports"
      subtitle="One report per staff member per day — morning check through close."
    >
      <form
        onSubmit={onSubmit}
        className="grid gap-4 rounded-3xl border border-forest/10 bg-cream p-5 shadow-sm sm:grid-cols-2"
      >
        <div>
          <label htmlFor="reportDate" className="mb-1.5 block text-sm font-medium text-forest">
            Report date
          </label>
          <input
            id="reportDate"
            type="date"
            required
            value={reportDate}
            onChange={(e) => setReportDate(e.target.value)}
            className="w-full rounded-xl border border-forest/15 bg-white px-4 py-3 text-sm outline-none focus:border-forest"
          />
        </div>
        <div>
          <label htmlFor="cowsChecked" className="mb-1.5 block text-sm font-medium text-forest">
            Cows checked
          </label>
          <input
            id="cowsChecked"
            type="number"
            min={0}
            required
            value={cowsChecked}
            onChange={(e) => setCowsChecked(e.target.value)}
            className="w-full rounded-xl border border-forest/15 bg-white px-4 py-3 text-sm outline-none focus:border-forest"
          />
        </div>
        <div>
          <label htmlFor="milkTotal" className="mb-1.5 block text-sm font-medium text-forest">
            Total milk (L)
          </label>
          <input
            id="milkTotal"
            type="number"
            min={0}
            step={0.1}
            required
            value={milkTotalLitres}
            onChange={(e) => setMilkTotalLitres(e.target.value)}
            className="w-full rounded-xl border border-forest/15 bg-white px-4 py-3 text-sm outline-none focus:border-forest"
          />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="summary" className="mb-1.5 block text-sm font-medium text-forest">
            Summary
          </label>
          <textarea
            id="summary"
            required
            minLength={10}
            rows={3}
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            className="w-full rounded-xl border border-forest/15 bg-white px-4 py-3 text-sm outline-none focus:border-forest"
          />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="issues" className="mb-1.5 block text-sm font-medium text-forest">
            Issues
          </label>
          <textarea
            id="issues"
            rows={2}
            value={issues}
            onChange={(e) => setIssues(e.target.value)}
            className="w-full rounded-xl border border-forest/15 bg-white px-4 py-3 text-sm outline-none focus:border-forest"
          />
        </div>
        <div className="sm:col-span-2">
          <SubmitBar loading={saving} label="Submit report" />
        </div>
      </form>

      <RecordList loading={listLoading} empty={rows.length === 0}>
        {rows.map((row) => (
          <li key={row.id} className="rounded-3xl border border-forest/10 bg-cream p-4 shadow-sm">
            <p className="font-semibold text-forest">
              {row.reportDate} · {row.cowsChecked} cows · {row.milkTotalLitres}L
            </p>
            <p className="mt-1 text-sm text-muted">
              {row.recordedByName} · {new Date(row.createdAt).toLocaleString()}
            </p>
            <p className="mt-2 text-sm text-forest/80">{row.summary}</p>
            {row.issues ? <p className="mt-1 text-sm text-muted">Issues: {row.issues}</p> : null}
          </li>
        ))}
      </RecordList>
    </FarmFormShell>
  );
}
