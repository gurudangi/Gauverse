import { useEffect, useState, type FormEvent } from "react";
import { api } from "../../lib/api";
import { useToast } from "../../contexts/ToastContext";
import {
  CowSelect,
  FarmFormShell,
  NotesField,
  RecordList,
  SubmitBar,
  useFarmCows,
} from "./farmUi";

interface MilkRow {
  id: string;
  cowName: string;
  litres: number;
  session: string;
  recordedByName: string;
  notes: string;
  recordedAt: string;
}

export function FarmMilkPage() {
  const { showToast } = useToast();
  const { cows } = useFarmCows();
  const [rows, setRows] = useState<MilkRow[]>([]);
  const [listLoading, setListLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [cowId, setCowId] = useState("");
  const [litres, setLitres] = useState("8");
  const [session, setSession] = useState<"morning" | "evening">("morning");
  const [notes, setNotes] = useState("");

  const reload = async () => {
    const res = await api.getFarmMilk();
    setRows(res.data ?? []);
  };

  useEffect(() => {
    reload()
      .catch((err) =>
        showToast(err instanceof Error ? err.message : "Could not load milk records", "error"),
      )
      .finally(() => setListLoading(false));
  }, [showToast]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.createFarmMilk({
        cowId,
        litres: Number(litres),
        session,
        notes,
      });
      showToast("Milk collection recorded");
      setNotes("");
      await reload();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Could not save", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <FarmFormShell title="Milk collection" subtitle="Log morning and evening yields per cow.">
      <form
        onSubmit={onSubmit}
        className="grid gap-4 rounded-3xl border border-forest/10 bg-cream p-5 shadow-sm sm:grid-cols-2"
      >
        <CowSelect cows={cows} value={cowId} onChange={setCowId} />
        <div>
          <label htmlFor="litres" className="mb-1.5 block text-sm font-medium text-forest">
            Litres
          </label>
          <input
            id="litres"
            type="number"
            min={0.1}
            step={0.1}
            required
            value={litres}
            onChange={(e) => setLitres(e.target.value)}
            className="w-full rounded-xl border border-forest/15 bg-white px-4 py-3 text-sm outline-none focus:border-forest"
          />
        </div>
        <div>
          <label htmlFor="session" className="mb-1.5 block text-sm font-medium text-forest">
            Session
          </label>
          <select
            id="session"
            value={session}
            onChange={(e) => setSession(e.target.value as "morning" | "evening")}
            className="w-full rounded-xl border border-forest/15 bg-white px-4 py-3 text-sm outline-none focus:border-forest"
          >
            <option value="morning">Morning</option>
            <option value="evening">Evening</option>
          </select>
        </div>
        <div className="sm:col-span-2">
          <NotesField value={notes} onChange={setNotes} />
        </div>
        <div className="sm:col-span-2">
          <SubmitBar loading={saving} label="Record milk" />
        </div>
      </form>

      <RecordList loading={listLoading} empty={rows.length === 0}>
        {rows.map((row) => (
          <li key={row.id} className="rounded-3xl border border-forest/10 bg-cream p-4 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="font-semibold text-forest">
                  {row.cowName} · {row.litres}L · {row.session}
                </p>
                <p className="mt-1 text-sm text-muted">
                  {row.recordedByName} · {new Date(row.recordedAt).toLocaleString()}
                </p>
              </div>
            </div>
            {row.notes ? <p className="mt-2 text-sm text-muted">{row.notes}</p> : null}
          </li>
        ))}
      </RecordList>
    </FarmFormShell>
  );
}
