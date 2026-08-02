import { Link, NavLink, Outlet } from "react-router-dom";
import {
  ClipboardList,
  HeartPulse,
  LayoutDashboard,
  LogOut,
  Milk,
  PawPrint,
  Syringe,
  Wheat,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { useToast } from "../../contexts/ToastContext";

const nav = [
  { to: "/farm", end: true, label: "Dashboard", icon: LayoutDashboard },
  { to: "/farm/cows", label: "Cows", icon: PawPrint },
  { to: "/farm/milk", label: "Milk", icon: Milk },
  { to: "/farm/health", label: "Health", icon: HeartPulse },
  { to: "/farm/feed", label: "Feed", icon: Wheat },
  { to: "/farm/vaccinations", label: "Vaccinations", icon: Syringe },
  { to: "/farm/reports", label: "Daily reports", icon: ClipboardList },
];

export function FarmLayout() {
  const { user, logout } = useAuth();
  const { showToast } = useToast();

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream via-cream to-cream-dark">
      <header className="border-b border-forest/10 bg-forest text-cream">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link to="/farm" className="font-display text-xl font-semibold">
            GauVerse Farm
          </Link>
          <div className="flex items-center gap-4 text-sm">
            <span className="hidden opacity-80 sm:inline">{user?.name}</span>
            <Link to="/" className="hover:underline">
              View site
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[220px_1fr] lg:px-8">
        <aside className="h-fit rounded-3xl border border-forest/10 bg-cream p-4 shadow-sm">
          <nav className="space-y-1">
            {nav.map(({ to, end, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium ${
                    isActive ? "bg-forest text-cream" : "text-forest/80 hover:bg-forest/5"
                  }`
                }
              >
                <Icon className="h-4 w-4" />
                {label}
              </NavLink>
            ))}
            <button
              type="button"
              onClick={async () => {
                await logout();
                showToast("Signed out");
              }}
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
