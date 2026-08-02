import { NavLink, Outlet } from "react-router-dom";
import {
  Bell,
  Heart,
  LayoutDashboard,
  LogOut,
  Milk,
  Package,
  PawPrint,
  UserRound,
  Wallet,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { useToast } from "../../contexts/ToastContext";
import { Link } from "react-router-dom";

const nav = [
  { to: "/account", end: true, label: "Dashboard", icon: LayoutDashboard },
  { to: "/account/orders", label: "Orders", icon: Package },
  { to: "/account/subscriptions", label: "Subscriptions", icon: Milk },
  { to: "/account/profile", label: "Profile", icon: UserRound },
  { to: "/account/wishlist", label: "Wishlist", icon: Heart },
  { to: "/account/donations", label: "Donations", icon: Wallet },
  { to: "/account/adoptions", label: "Adopted Cows", icon: PawPrint },
  { to: "/account/notifications", label: "Notifications", icon: Bell },
];

export function AccountLayout() {
  const { user, logout } = useAuth();
  const { showToast } = useToast();

  const handleLogout = async () => {
    await logout();
    showToast("Signed out");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream via-cream to-cream-dark">
      <header className="border-b border-forest/10 bg-cream/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link to="/" className="font-display text-xl font-semibold text-forest">
            GauVerse Account
          </Link>
          <div className="flex items-center gap-3 text-sm">
            <span className="hidden text-muted sm:inline">{user?.email}</span>
            <Link to="/" className="font-medium text-forest hover:underline">
              Back to site
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[240px_1fr] lg:px-8">
        <aside className="h-fit rounded-3xl border border-forest/10 bg-cream p-4 shadow-sm">
          <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wide text-muted">
            Menu
          </p>
          <nav className="space-y-1">
            {nav.map(({ to, end, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-forest text-cream"
                      : "text-forest/80 hover:bg-forest/5"
                  }`
                }
              >
                <Icon className="h-4 w-4" />
                {label}
              </NavLink>
            ))}
            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium text-forest/80 hover:bg-forest/5"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </nav>
        </aside>

        <main className="min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
