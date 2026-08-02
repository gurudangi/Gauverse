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

interface HealthRow {
  id: string;
  cowName: string;
  condition: string;
  temperatureC: number | null;
  symptoms: string;
  treatment: string;
  medicineGiven: string;
  recordedByName: string;
  recordedAt: string;
}

export function FarmHealthPage() {
  const { showToast } = useToast();
  const { cows } = useFarmCows();
  const [rows, setRows] = useState<HealthRow[]>([]);
  const [listLoading, setListLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [cowId, setCowId] = useState("");
  const [condition, setCondition] = useState("healthy");
  const [temperatureC, setTemperatureC] = useState("");
  const [symptoms, setSymptoms] = useState("");
  const [treatment, setTreatment] = useState("");
  const [medicineGiven, setMedicineGiven] = useState("");
  const [notes, setNotes] = useState("");

  const reload = async () => {
    const res = await api.getFarmHealth();
    setRows(res.data ?? []);
  };

  useEffect(() => {
    reload()
      .catch((err) =>
        showToast(err instanceof Error ? err.message : "Could not load health records", "error"),
      )
      .finally(() => setListLoading(false));
  }, [showToast]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.createFarmHealth({
        cowId,
        condition,
        temperatureC: temperatureC ? Number(temperatureC) : null,
        symptoms,
        treatment,
        medicineGiven,
        notes,
      });
      showToast("Health update recorded");
      setSymptoms("");
      setTreatment("");
      setMedicineGiven("");
      setNotes("");
      await reload();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Could not save", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <FarmFormShell title="Health & medicine" subtitle="Update condition, symptoms, and treatment.">
      <form
        onSubmit={onSubmit}
        className="grid gap-4 rounded-3xl border border-forest/10 bg-cream p-5 shadow-sm sm:grid-cols-2"
      >
        <CowSelect cows={cows} value={cowId} onChange={setCowId} />
        <div>
          <label htmlFor="condition" className="mb-1.5 block text-sm font-medium text-forest">
            Condition
          </label>
          <select
            id="condition"
            value={condition}
            onChange={(e) => setCondition(e.target.value)}
            className="w-full rounded-xl border border-forest/15 bg-white px-4 py-3 text-sm outline-none focus:border-forest"
          >
            <option value="healthy">Healthy</option>
            <option value="under_observation">Under observation</option>
            <option value="sick">Sick</option>
            <option value="recovering">Recovering</option>
          </select>
        </div>
        <div>
          <label htmlFor="temp" className="mb-1.5 block text-sm font-medium text-forest">
            Temperature (°C)
          </label>
          <input
            id="temp"
            type="number"
            step={0.1}
            value={temperatureC}
            onChange={(e) => setTemperatureC(e.target.value)}
            className="w-full rounded-xl border border-forest/15 bg-white px-4 py-3 text-sm outline-none focus:border-forest"
          />
        </div>
        <div>
          <label htmlFor="medicine" className="mb-1.5 block text-sm font-medium text-forest">
            Medicine given
          </label>
          <input
            id="medicine"
            value={medicineGiven}
            onChange={(e) => setMedicineGiven(e.target.value)}
            className="w-full rounded-xl border border-forest/15 bg-white px-4 py-3 text-sm outline-none focus:border-forest"
          />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="symptoms" className="mb-1.5 block text-sm font-medium text-forest">
            Symptoms
          </label>
          <textarea
            id="symptoms"
            rows={2}
            value={symptoms}
            onChange={(e) => setSymptoms(e.target.value)}
            className="w-full rounded-xl border border-forest/15 bg-white px-4 py-3 text-sm outline-none focus:border-forest"
          />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="treatment" className="mb-1.5 block text-sm font-medium text-forest">
            Treatment
          </label>
          <textarea
            id="treatment"
            rows={2}
            value={treatment}
            onChange={(e) => setTreatment(e.target.value)}
            className="w-full rounded-xl border border-forest/15 bg-white px-4 py-3 text-sm outline-none focus:border-forest"
          />
        </div>
        <div className="sm:col-span-2">
          <NotesField value={notes} onChange={setNotes} />
        </div>
        <div className="sm:col-span-2">
          <SubmitBar loading={saving} label="Save health update" />
        </div>
      </form>

      <RecordList loading={listLoading} empty={rows.length === 0}>
        {rows.map((row) => (
          <li key={row.id} className="rounded-3xl border border-forest/10 bg-cream p-4 shadow-sm">
            <p className="font-semibold capitalize text-forest">
              {row.cowName} · {row.condition.replaceAll("_", " ")}
              {row.temperatureC != null ? ` · ${row.temperatureC}°C` : ""}
            </p>
            <p className="mt-1 text-sm text-muted">
              {row.recordedByName} · {new Date(row.recordedAt).toLocaleString()}
            </p>
            {row.symptoms ? <p className="mt-2 text-sm text-muted">Symptoms: {row.symptoms}</p> : null}
            {row.treatment ? <p className="text-sm text-muted">Treatment: {row.treatment}</p> : null}
            {row.medicineGiven ? (
              <p className="text-sm text-muted">Medicine: {row.medicineGiven}</p>
            ) : null}
          </li>
        ))}
      </RecordList>
    </FarmFormShell>
  );
}
