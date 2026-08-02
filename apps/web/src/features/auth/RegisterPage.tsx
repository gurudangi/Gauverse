import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useToast } from "../../contexts/ToastContext";
import { Button } from "../../components/ui/Button";

export function RegisterPage() {
  const { register } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register({
        name: form.name,
        email: form.email,
        phone: form.phone || undefined,
        password: form.password,
      });
      showToast("Account created successfully!");
      navigate("/account");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Registration failed", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-cream via-cream to-cream-dark px-4 py-16">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-md space-y-5 rounded-3xl border border-forest/10 bg-cream p-8 shadow-xl"
      >
        <div>
          <p className="text-sm font-medium text-saffron">Account</p>
          <h1 className="font-display text-3xl font-semibold text-forest">Create account</h1>
          <p className="mt-2 text-sm text-muted">
            Join GauVerse to shop, donate, and manage subscriptions.
          </p>
        </div>

        {(
          [
            ["name", "Full name", "text"],
            ["email", "Email", "email"],
            ["phone", "Phone", "tel"],
            ["password", "Password", "password"],
          ] as const
        ).map(([key, label, type]) => (
          <div key={key}>
            <label htmlFor={`reg-${key}`} className="mb-1.5 block text-sm font-medium text-forest">
              {label}
            </label>
            <input
              id={`reg-${key}`}
              type={type}
              required={key !== "phone"}
              minLength={key === "password" ? 8 : undefined}
              value={form[key]}
              onChange={(e) => setForm((prev) => ({ ...prev, [key]: e.target.value }))}
              className="w-full rounded-xl border border-forest/15 bg-white px-4 py-3 text-sm text-forest outline-none focus:border-forest"
            />
          </div>
        ))}

        <p className="text-xs text-muted">
          Password must be at least 8 characters and include a letter and a number.
        </p>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Creating…" : "Create account"}
        </Button>

        <p className="text-center text-sm text-muted">
          Already registered?{" "}
          <Link to="/login" className="font-semibold text-forest hover:underline">
            Sign in
          </Link>
        </p>
      </form>
    </div>
  );
}
