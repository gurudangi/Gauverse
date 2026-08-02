import { stats } from "../../data/content";
import { SectionHeading } from "../ui/SectionHeading";

export function Stats() {
  return (
    <section className="relative -mt-16 z-20 mx-auto max-w-6xl px-4 sm:px-6">
      <div className="glass-card grid grid-cols-2 gap-6 p-8 md:grid-cols-4 md:gap-8 md:p-10">
        {stats.map((stat) => (
          <div key={stat.label} className="text-center">
            <p className="font-display text-4xl font-bold text-forest sm:text-5xl">
              {stat.value}
            </p>
            <p className="mt-1 text-sm font-medium text-muted">{stat.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export function About() {
  return (
    <section id="about" className="section-padding">
      <div className="mx-auto max-w-7xl">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
          <div className="relative">
            <div className="overflow-hidden rounded-3xl shadow-2xl shadow-forest/10">
              <img
                src="/images/hero-gir-cow.jpg"
                alt="Indigenous Gir cow at Ahilyamata Gaushala"
                className="aspect-[4/5] w-full object-cover object-[60%_35%]"
              />
            </div>
            <div className="absolute -bottom-6 -right-6 hidden rounded-2xl bg-forest p-6 text-cream shadow-xl sm:block">
              <p className="font-display text-3xl font-bold text-saffron">15+</p>
              <p className="text-sm text-cream/80">Years of Gau Seva</p>
            </div>
            <div className="absolute -left-4 -top-4 h-24 w-24 rounded-full border-4 border-saffron/30" />
          </div>

          <div>
            <SectionHeading
              eyebrow="About Us"
              title="A Sanctuary for India's Sacred Gir Cows"
              subtitle="Founded with devotion to Mata Ahilyabai Holkar's legacy, our gaushala stands as a beacon of indigenous cattle conservation in the heart of Madhya Pradesh."
              align="left"
            />

            <div className="space-y-4 text-muted leading-relaxed">
              <p>
                Shri Ahilyamata Gaushala J M Indore is more than a dairy farm — it is a
                living testament to India's rich agricultural heritage. We house over 150
                purebred Gir cows, each treated as family and cared for with Ayurvedic
                principles.
              </p>
              <p>
                From dawn milking rituals to organic fodder cultivation, every practice
                at our farm honors the sacred bond between humans and gau mata. Our
                commitment to transparency means you know exactly where your milk comes
                from and how our cows are treated.
              </p>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {[
                "Pure Gir breed lineage",
                "Veterinary care on-site",
                "Organic pasture grazing",
                "Transparent operations",
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-3 rounded-xl bg-cream-dark/50 px-4 py-3"
                >
                  <div className="h-2 w-2 rounded-full bg-saffron" />
                  <span className="text-sm font-medium text-forest">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
