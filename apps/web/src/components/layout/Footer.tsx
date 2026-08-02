import { Heart, Mail, MapPin, Phone } from "lucide-react";
import { navLinks, siteConfig } from "../../data/content";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-forest-dark text-cream">
      <div className="section-padding mx-auto max-w-7xl">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-1">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-saffron/20 font-display text-xl font-bold text-saffron">
                ॐ
              </div>
              <div>
                <p className="font-display text-xl font-semibold">{siteConfig.name}</p>
                <p className="text-sm text-cream/60">{siteConfig.tagline}</p>
              </div>
            </div>
            <p className="text-sm leading-relaxed text-cream/70">
              A family-owned Gir cow dairy delivering pure A2 milk, handcrafted ghee,
              paneer, and Panchgavya products — farm fresh from Indore to your doorstep.
            </p>
          </div>

          <div>
            <h3 className="mb-4 font-display text-lg font-semibold text-saffron-light">
              Quick Links
            </h3>
            <ul className="space-y-2">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="text-sm text-cream/70 transition-colors hover:text-saffron-light"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-4 font-display text-lg font-semibold text-saffron-light">
              Our Offerings
            </h3>
            <ul className="space-y-2 text-sm text-cream/70">
              <li>Fresh A2 Gir Milk</li>
              <li>Desi Ghee & Paneer</li>
              <li>Panchgavya Products</li>
              <li>Milk Subscriptions</li>
              <li>Farm Visit Tours</li>
              <li>On-site Product Purchase</li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 font-display text-lg font-semibold text-saffron-light">
              Contact Us
            </h3>
            <ul className="space-y-3 text-sm text-cream/70">
              <li className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-saffron" />
                <a
                  href={siteConfig.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-saffron-light"
                >
                  {siteConfig.address}
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-4 w-4 shrink-0 text-saffron" />
                <a href={`tel:${siteConfig.phone.replace(/\s/g, "")}`} className="hover:text-saffron-light">
                  {siteConfig.phone}
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-4 w-4 shrink-0 text-saffron" />
                <a href={`mailto:${siteConfig.email}`} className="hover:text-saffron-light">
                  {siteConfig.email}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-cream/10 pt-8 sm:flex-row">
          <p className="text-sm text-cream/50">
            © {year} {siteConfig.name}. All rights reserved.
          </p>
          <p className="flex items-center gap-1.5 text-sm text-cream/50">
            Made with <Heart className="h-3.5 w-3.5 fill-saffron text-saffron" /> for pure dairy
          </p>
        </div>
      </div>
    </footer>
  );
}
