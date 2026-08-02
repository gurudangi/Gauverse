import { Link } from "react-router-dom";
import { Milk, Package, Wallet } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";

export function AccountDashboard() {
  const { user } = useAuth();

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm font-medium text-saffron">Welcome back</p>
        <h1 className="font-display text-3xl font-semibold text-forest sm:text-4xl">
          {user?.name}
        </h1>
        <p className="mt-2 text-muted">
          Manage your orders, subscriptions, and donations from one place.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          {
            title: "Orders",
            desc: "Track product purchases",
            to: "/account/orders",
            icon: Package,
          },
          {
            title: "Subscriptions",
            desc: "Pause or resume milk plans",
            to: "/account/subscriptions",
            icon: Milk,
          },
          {
            title: "Donations",
            desc: "Receipts & certificates",
            to: "/account/donations",
            icon: Wallet,
          },
        ].map(({ title, desc, to, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            className="rounded-3xl border border-forest/10 bg-cream p-5 shadow-sm transition hover:border-saffron/30 hover:shadow-md"
          >
            <Icon className="h-5 w-5 text-saffron" />
            <h2 className="mt-4 font-display text-xl font-semibold text-forest">{title}</h2>
            <p className="mt-1 text-sm text-muted">{desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
