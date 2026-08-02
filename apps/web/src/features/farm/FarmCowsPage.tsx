import { useState } from "react";
import { Loader2 } from "lucide-react";
import { api } from "../../lib/api";
import { useToast } from "../../contexts/ToastContext";
import { Button } from "../../components/ui/Button";
import { FarmFormShell, useFarmCows, type FarmCowOption } from "./farmUi";

export function FarmCowsPage() {
  const { showToast } = useToast();
  const { cows, loading, setCows } = useFarmCows();
  const [busyId, setBusyId] = useState<string | null>(null);

  const updateStatus = async (cow: FarmCowOption, status: FarmCowOption["status"]) => {
    setBusyId(cow.id);
    try {
      const res = await api.updateFarmCow(cow.id, { status });
      if (res.data) {
        setCows((prev) => prev.map((c) => (c.id === cow.id ? { ...c, ...res.data! } : c)));
      }
      showToast(`${cow.name} marked ${status.replaceAll("_", " ")}`);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Update failed", "error");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <FarmFormShell
      title="Herd roster"
      subtitle="Update operational status. Pricing and finance stay with admin."
    >
      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-7 w-7 animate-spin text-forest" />
        </div>
      ) : (
        <ul className="space-y-4">
          {cows.map((cow) => (
            <li
              key={cow.id}
              className="rounded-3xl border border-forest/10 bg-cream p-5 shadow-sm"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-display text-xl font-semibold text-forest">{cow.name}</p>
                  <p className="mt-1 text-sm text-muted">
                    {cow.breed} · {cow.milkYieldLabel} · {cow.status.replaceAll("_", " ")}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(["healthy", "under_care", "retired"] as const).map((status) => (
                    <Button
                      key={status}
                      variant="outline"
                      disabled={busyId === cow.id || cow.status === status}
                      onClick={() => updateStatus(cow, status)}
                    >
                      {status.replaceAll("_", " ")}
                    </Button>
                  ))}
                </div>
              </div>
              <p className="mt-3 text-sm text-muted">{cow.description}</p>
            </li>
          ))}
        </ul>
      )}
    </FarmFormShell>
  );
}
