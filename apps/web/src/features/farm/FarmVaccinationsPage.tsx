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

interface VaxRow {
  id: string;
  cowName: string;
  vaccineName: string;
  dose: string;
  nextDueAt: string | null;
  recordedByName: string;
  notes: string;
  recordedAt: string;
}

export function FarmVaccinationsPage() {
  const { showToast } = useToast();
  const { cows } = useFarmCows();
  const [rows, setRows] = useState<VaxRow[]>([]);
  const [listLoading, setListLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [cowId, setCowId] = useState("");
  const [vaccineName, setVaccineName] = useState("");
  const [dose, setDose] = useState("");
  const [nextDueAt, setNextDueAt] = useState("");
  const [notes, setNotes] = useState("");

  const reload = async () => {
    const res = await api.getFarmVaccinations();
    setRows(res.data ?? []);
  };

  useEffect(() => {
    reload()
      .catch((err) =>
        showToast(
          err instanceof Error ? err.message : "Could not load vaccinations",
          "error",
        ),
      )
      .finally(() => setListLoading(false));
  }, [showToast]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.createFarmVaccination({
        cowId,
        vaccineName,
        dose,
        nextDueAt: nextDueAt ? new Date(nextDueAt).toISOString() : null,
        notes,
      });
      showToast("Vaccination recorded");
      setVaccineName("");
      setDose("");
      setNextDueAt("");
      setNotes("");
      await reload();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Could not save", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <FarmFormShell title="Vaccinations" subtitle="Record doses and schedule the next due date.">
      <form
        onSubmit={onSubmit}
        className="grid gap-4 rounded-3xl border border-forest/10 bg-cream p-5 shadow-sm sm:grid-cols-2"
      >
        <CowSelect cows={cows} value={cowId} onChange={setCowId} />
        <div>
          <label htmlFor="vaccine" className="mb-1.5 block text-sm font-medium text-forest">
            Vaccine
          </label>
          <input
            id="vaccine"
            required
            value={vaccineName}
            onChange={(e) => setVaccineName(e.target.value)}
            className="w-full rounded-xl border border-forest/15 bg-white px-4 py-3 text-sm outline-none focus:border-forest"
          />
        </div>
        <div>
          <label htmlFor="dose" className="mb-1.5 block text-sm font-medium text-forest">
            Dose
          </label>
          <input
            id="dose"
            value={dose}
            onChange={(e) => setDose(e.target.value)}
            className="w-full rounded-xl border border-forest/15 bg-white px-4 py-3 text-sm outline-none focus:border-forest"
          />
        </div>
        <div>
          <label htmlFor="nextDue" className="mb-1.5 block text-sm font-medium text-forest">
            Next due
          </label>
          <input
            id="nextDue"
            type="date"
            value={nextDueAt}
            onChange={(e) => setNextDueAt(e.target.value)}
            className="w-full rounded-xl border border-forest/15 bg-white px-4 py-3 text-sm outline-none focus:border-forest"
          />
        </div>
        <div className="sm:col-span-2">
          <NotesField value={notes} onChange={setNotes} />
        </div>
        <div className="sm:col-span-2">
          <SubmitBar loading={saving} label="Record vaccination" />
        </div>
      </form>

      <RecordList loading={listLoading} empty={rows.length === 0}>
        {rows.map((row) => (
          <li key={row.id} className="rounded-3xl border border-forest/10 bg-cream p-4 shadow-sm">
            <p className="font-semibold text-forest">
              {row.cowName} · {row.vaccineName}
              {row.dose ? ` · ${row.dose}` : ""}
            </p>
            <p className="mt-1 text-sm text-muted">
              {row.recordedByName} · {new Date(row.recordedAt).toLocaleString()}
            </p>
            {row.nextDueAt ? (
              <p className="mt-1 text-sm text-muted">
                Next due: {new Date(row.nextDueAt).toLocaleDateString()}
              </p>
            ) : null}
            {row.notes ? <p className="mt-2 text-sm text-muted">{row.notes}</p> : null}
          </li>
        ))}
      </RecordList>
    </FarmFormShell>
  );
}
