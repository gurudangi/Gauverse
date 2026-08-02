import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Menu, ShoppingBag, X, Phone } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { useCart } from "../../contexts/CartContext";
import { useToast } from "../../contexts/ToastContext";
import { navLinks, siteConfig } from "../../data/content";
import { Button } from "../ui/Button";

export function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { openCart, itemCount } = useCart();
  const { user, logout } = useAuth();
  const { showToast } = useToast();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const onHero = !scrolled;

  const handleLogout = async () => {
    await logout();
    showToast("Signed out");
    setIsOpen(false);
  };

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-cream/95 shadow-md shadow-forest/5 backdrop-blur-lg"
          : "bg-gradient-to-b from-forest-dark/85 via-forest-dark/40 to-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <a href="#home" className="group flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-forest text-lg font-display font-bold text-saffron shadow-lg transition-transform group-hover:scale-105">
            ॐ
          </div>
          <div className="hidden sm:block">
            <p
              className={`font-display text-lg font-semibold leading-tight transition-colors ${
                onHero ? "text-cream" : "text-forest"
              }`}
            >
              {siteConfig.name}
            </p>
            <p
              className={`text-xs tracking-wide transition-colors ${
                onHero ? "text-cream/70" : "text-muted"
              }`}
            >
              {siteConfig.location}
            </p>
          </div>
        </a>

        <nav className="hidden items-center gap-1 lg:flex">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                onHero
                  ? "text-cream/90 hover:bg-cream/15 hover:text-cream"
                  : "text-forest/80 hover:bg-forest/5 hover:text-forest"
              }`}
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <a
            href={`tel:${siteConfig.phone.replace(/\s/g, "")}`}
            className={`flex items-center gap-2 text-sm font-medium transition-colors ${
              onHero
                ? "text-cream/85 hover:text-cream"
                : "text-forest/70 hover:text-forest"
            }`}
          >
            <Phone className="h-4 w-4" />
            <span className="hidden xl:inline">{siteConfig.phone}</span>
          </a>
          <button
            type="button"
            onClick={openCart}
            className={`relative rounded-full p-2.5 transition-colors ${
              onHero
                ? "text-cream hover:bg-cream/15"
                : "text-forest hover:bg-forest/5"
            }`}
            aria-label="Open cart"
          >
            <ShoppingBag className="h-5 w-5" />
            {itemCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-saffron text-xs font-bold text-forest-dark">
                {itemCount}
              </span>
            )}
          </button>
          {user ? (
            <>
              {(user.roles.includes("admin") || user.roles.includes("super_admin")) && (
                <Link
                  to="/admin"
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                    onHero
                      ? "bg-saffron/90 text-forest-dark hover:bg-saffron"
                      : "bg-saffron text-forest-dark hover:bg-saffron-light"
                  }`}
                >
                  Admin
                </Link>
              )}
              {(user.roles.includes("farm_staff") ||
                user.roles.includes("veterinary_doctor") ||
                user.roles.includes("admin") ||
                user.roles.includes("super_admin")) && (
                <Link
                  to="/farm"
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                    onHero
                      ? "bg-cream/15 text-cream hover:bg-cream/25"
                      : "bg-forest/5 text-forest hover:bg-forest/10"
                  }`}
                >
                  Farm
                </Link>
              )}
              {(user.roles.includes("inventory_manager") ||
                user.roles.includes("admin") ||
                user.roles.includes("super_admin")) && (
                <Link
                  to="/inventory"
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                    onHero
                      ? "bg-cream/15 text-cream hover:bg-cream/25"
                      : "bg-forest/5 text-forest hover:bg-forest/10"
                  }`}
                >
                  Inventory
                </Link>
              )}
              <Link
                to="/account"
                className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                  onHero
                    ? "bg-cream/15 text-cream hover:bg-cream/25"
                    : "bg-forest/5 text-forest hover:bg-forest/10"
                }`}
              >
                My Account
              </Link>
              <Button variant={onHero ? "outlineLight" : "outline"} onClick={handleLogout}>
                Sign out
              </Button>
            </>
          ) : (
            <Link
              to="/login"
              className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                onHero
                  ? "bg-cream/15 text-cream hover:bg-cream/25"
                  : "bg-forest/5 text-forest hover:bg-forest/10"
              }`}
            >
              Sign in
            </Link>
          )}
          <Button href="#farm-visit" variant="secondary">
            Book Farm Visit
          </Button>
        </div>

        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`rounded-lg p-2 lg:hidden ${onHero ? "text-cream" : "text-forest"}`}
          aria-label={isOpen ? "Close menu" : "Open menu"}
        >
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {isOpen && (
        <div className="border-t border-forest/10 bg-cream lg:hidden">
          <nav className="flex flex-col px-4 py-4">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className="border-b border-forest/5 py-3 text-base font-medium text-forest"
              >
                {link.label}
              </a>
            ))}
            <div className="mt-4 flex flex-col gap-3">
              {user ? (
                <>
                  <Link
                    to="/account"
                    onClick={() => setIsOpen(false)}
                    className="inline-flex w-full items-center justify-center rounded-full border-2 border-forest px-6 py-3 text-sm font-semibold text-forest"
                  >
                    My Account
                  </Link>
                  <Button onClick={handleLogout} variant="outline" className="w-full">
                    Sign out
                  </Button>
                </>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setIsOpen(false)}
                  className="inline-flex w-full items-center justify-center rounded-full border-2 border-forest px-6 py-3 text-sm font-semibold text-forest"
                >
                  Sign in
                </Link>
              )}
              <Button
                onClick={() => {
                  openCart();
                  setIsOpen(false);
                }}
                variant="secondary"
                className="w-full"
              >
                <ShoppingBag className="h-4 w-4" />
                Cart {itemCount > 0 ? `(${itemCount})` : ""}
              </Button>
              <Button
                href="#products"
                variant="outline"
                className="w-full"
                onClick={() => setIsOpen(false)}
              >
                Shop Products
              </Button>
              <Button
                href="#farm-visit"
                variant="outline"
                className="w-full"
                onClick={() => setIsOpen(false)}
              >
                Book Farm Visit
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
