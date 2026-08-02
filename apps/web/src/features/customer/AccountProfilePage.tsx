import { useState, type FormEvent } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useToast } from "../../contexts/ToastContext";
import { Button } from "../../components/ui/Button";

export function AccountProfilePage() {
  const { user, updateProfile } = useAuth();
  const { showToast } = useToast();
  const [name, setName] = useState(user?.name ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateProfile({ name, phone: phone || undefined });
      showToast("Profile updated");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Update failed", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-semibold text-forest">Profile</h1>
        <p className="mt-2 text-sm text-muted">Update how we contact you.</p>
      </div>

      <form
        onSubmit={onSubmit}
        className="max-w-lg space-y-5 rounded-3xl border border-forest/10 bg-cream p-6 shadow-sm"
      >
        <div>
          <label className="mb-1.5 block text-sm font-medium text-forest" htmlFor="profile-email">
            Email
          </label>
          <input
            id="profile-email"
            value={user?.email ?? ""}
            disabled
            className="w-full rounded-xl border border-forest/10 bg-cream-dark/40 px-4 py-3 text-sm text-muted"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-forest" htmlFor="profile-name">
            Full name
          </label>
          <input
            id="profile-name"
            required
            minLength={2}
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-xl border border-forest/15 bg-white px-4 py-3 text-sm outline-none focus:border-forest"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-forest" htmlFor="profile-phone">
            Phone
          </label>
          <input
            id="profile-phone"
            minLength={10}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full rounded-xl border border-forest/15 bg-white px-4 py-3 text-sm outline-none focus:border-forest"
          />
        </div>
        <Button type="submit" disabled={loading}>
          {loading ? "Saving…" : "Save changes"}
        </Button>
      </form>
    </div>
  );
}
