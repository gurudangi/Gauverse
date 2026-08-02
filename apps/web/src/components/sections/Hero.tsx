import { ArrowRight, ChevronDown, Leaf, MapPin, Shield, Sparkles } from "lucide-react";
import { Button } from "../ui/Button";

export function Hero() {
  return (
    <section
      id="home"
      className="relative flex min-h-screen items-center overflow-hidden"
    >
      <div className="absolute inset-0">
        <img
          src="/images/hero-gir-cow.jpg"
          alt="Indigenous Gir cow — Shri Ahilyamata Gaushala dairy farm"
          className="h-full w-full object-cover object-[72%_40%] scale-[1.02]"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-forest-dark/92 via-forest-dark/55 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-forest-dark/45 via-transparent to-forest-dark/15" />
      </div>

      <div className="absolute inset-0 opacity-[0.03]">
        <div
          className="h-full w-full"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 pt-28 pb-20 sm:px-6 lg:px-8 lg:pt-32">
        <div className="max-w-3xl">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-saffron/30 bg-saffron/10 px-4 py-1.5 text-sm font-medium text-saffron-light backdrop-blur-sm">
            <Sparkles className="h-4 w-4" />
            Pure A2 Gir Cow Dairy · Indore
          </div>

          <h1 className="font-display text-5xl font-semibold leading-[1.1] text-cream sm:text-6xl lg:text-7xl">
            Where Tradition
            <span className="block text-saffron-light">Meets Purity</span>
          </h1>

          <p className="mt-6 max-w-xl text-lg leading-relaxed text-cream/80 sm:text-xl">
            Shri Ahilyamata Gaushala is your trusted Gir cow dairy — farm-fresh A2 milk,
            handcrafted ghee & paneer, and Panchgavya products delivered straight from our
            farm to your home.
          </p>

          <div className="mt-10 flex flex-wrap gap-4">
            <Button href="#products" variant="secondary" className="text-base">
              Shop Products
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button href="#farm-visit" variant="outlineLight" className="text-base">
              <MapPin className="h-4 w-4" />
              Book Farm Visit
            </Button>
          </div>

          <div className="mt-14 flex flex-wrap gap-8">
            {[
              { icon: Shield, label: "100% Pure A2" },
              { icon: Leaf, label: "Organic Feed" },
              { icon: Sparkles, label: "Zero Adulteration" },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-2 text-cream/70">
                <Icon className="h-5 w-5 text-saffron" />
                <span className="text-sm font-medium">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <a
        href="#about"
        className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2 animate-bounce text-cream/60 transition-colors hover:text-saffron-light"
        aria-label="Scroll to about section"
      >
        <ChevronDown className="h-8 w-8" />
      </a>
    </section>
  );
}

