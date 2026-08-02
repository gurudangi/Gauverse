import { useState, type FormEvent } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useToast } from "../../contexts/ToastContext";
import { Button } from "../../components/ui/Button";
import type { AuthUser } from "../../lib/api";

function homeForRoles(roles: string[]): string {
  if (roles.includes("admin") || roles.includes("super_admin")) return "/admin";
  if (roles.includes("inventory_manager")) return "/inventory";
  if (roles.includes("farm_staff") || roles.includes("veterinary_doctor")) return "/farm";
  return "/account";
}

export function LoginPage() {
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user: AuthUser = await login(email, password);
      showToast("Welcome back!");
      navigate(from ?? homeForRoles(user.roles));
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Login failed", "error");
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
          <h1 className="font-display text-3xl font-semibold text-forest">Sign in</h1>
          <p className="mt-2 text-sm text-muted">
            Access your orders, donations, and subscriptions.
          </p>
        </div>

        <div>
          <label htmlFor="login-email" className="mb-1.5 block text-sm font-medium text-forest">
            Email
          </label>
          <input
            id="login-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border border-forest/15 bg-white px-4 py-3 text-sm text-forest outline-none focus:border-forest"
          />
        </div>

        <div>
          <label htmlFor="login-password" className="mb-1.5 block text-sm font-medium text-forest">
            Password
          </label>
          <input
            id="login-password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl border border-forest/15 bg-white px-4 py-3 text-sm text-forest outline-none focus:border-forest"
          />
        </div>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Signing in…" : "Sign in"}
        </Button>

        <p className="text-center text-sm text-muted">
          New here?{" "}
          <Link to="/register" className="font-semibold text-forest hover:underline">
            Create an account
          </Link>
        </p>
      </form>
    </div>
  );
}
