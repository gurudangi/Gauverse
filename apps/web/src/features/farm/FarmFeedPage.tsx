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

interface FeedRow {
  id: string;
  cowName: string;
  feedType: string;
  quantityKg: number;
  recordedByName: string;
  notes: string;
  recordedAt: string;
}

export function FarmFeedPage() {
  const { showToast } = useToast();
  const { cows } = useFarmCows();
  const [rows, setRows] = useState<FeedRow[]>([]);
  const [listLoading, setListLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [cowId, setCowId] = useState("");
  const [feedType, setFeedType] = useState("Green fodder");
  const [quantityKg, setQuantityKg] = useState("5");
  const [notes, setNotes] = useState("");

  const reload = async () => {
    const res = await api.getFarmFeed();
    setRows(res.data ?? []);
  };

  useEffect(() => {
    reload()
      .catch((err) =>
        showToast(err instanceof Error ? err.message : "Could not load feed records", "error"),
      )
      .finally(() => setListLoading(false));
  }, [showToast]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.createFarmFeed({
        cowId,
        feedType,
        quantityKg: Number(quantityKg),
        notes,
      });
      showToast("Feed record saved");
      setNotes("");
      await reload();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Could not save", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <FarmFormShell title="Feed distribution" subtitle="Track fodder and feed given to each cow.">
      <form
        onSubmit={onSubmit}
        className="grid gap-4 rounded-3xl border border-forest/10 bg-cream p-5 shadow-sm sm:grid-cols-2"
      >
        <CowSelect cows={cows} value={cowId} onChange={setCowId} />
        <div>
          <label htmlFor="feedType" className="mb-1.5 block text-sm font-medium text-forest">
            Feed type
          </label>
          <input
            id="feedType"
            required
            value={feedType}
            onChange={(e) => setFeedType(e.target.value)}
            className="w-full rounded-xl border border-forest/15 bg-white px-4 py-3 text-sm outline-none focus:border-forest"
          />
        </div>
        <div>
          <label htmlFor="qty" className="mb-1.5 block text-sm font-medium text-forest">
            Quantity (kg)
          </label>
          <input
            id="qty"
            type="number"
            min={0.1}
            step={0.1}
            required
            value={quantityKg}
            onChange={(e) => setQuantityKg(e.target.value)}
            className="w-full rounded-xl border border-forest/15 bg-white px-4 py-3 text-sm outline-none focus:border-forest"
          />
        </div>
        <div className="sm:col-span-2">
          <NotesField value={notes} onChange={setNotes} />
        </div>
        <div className="sm:col-span-2">
          <SubmitBar loading={saving} label="Record feed" />
        </div>
      </form>

      <RecordList loading={listLoading} empty={rows.length === 0}>
        {rows.map((row) => (
          <li key={row.id} className="rounded-3xl border border-forest/10 bg-cream p-4 shadow-sm">
            <p className="font-semibold text-forest">
              {row.cowName} · {row.feedType} · {row.quantityKg} kg
            </p>
            <p className="mt-1 text-sm text-muted">
              {row.recordedByName} · {new Date(row.recordedAt).toLocaleString()}
            </p>
            {row.notes ? <p className="mt-2 text-sm text-muted">{row.notes}</p> : null}
          </li>
        ))}
      </RecordList>
    </FarmFormShell>
  );
}
