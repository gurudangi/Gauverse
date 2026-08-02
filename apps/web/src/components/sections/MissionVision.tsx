import { Eye, Heart, Sprout } from "lucide-react";
import { SectionHeading } from "../ui/SectionHeading";

const missionPoints = [
  "Deliver farm-fresh A2 dairy with zero compromise",
  "Raise indigenous Gir cows with organic care",
  "Offer transparent, traceable product quality",
  "Welcome customers to experience our farm firsthand",
];

const visionPoints = [
  "Indore's most trusted Gir cow dairy brand",
  "Farm-to-home freshness every single day",
  "Sustainable zero-waste organic farming",
  "Growing through quality products, not donations",
];

export function MissionVision() {
  return (
    <section className="section-padding bg-forest text-cream">
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          eyebrow="Purpose"
          title="Our Mission & Vision"
          subtitle="Guided by devotion to gau mata, we run a family-owned dairy focused on quality products and memorable farm experiences."
          light
        />

        <div className="grid gap-8 md:grid-cols-2">
          <div className="group rounded-3xl border border-cream/10 bg-cream/5 p-8 transition-all hover:border-saffron/30 hover:bg-cream/10 lg:p-10">
            <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-saffron/20">
              <Heart className="h-7 w-7 text-saffron-light" />
            </div>
            <h3 className="font-display text-2xl font-semibold text-saffron-light">
              Our Mission
            </h3>
            <p className="mt-3 text-cream/70 leading-relaxed">
              To run a world-class Gir cow dairy that serves families with pure A2 products,
              welcomes visitors to our farm, and preserves indigenous cattle through
              sustainable commercial farming.
            </p>
            <ul className="mt-6 space-y-3">
              {missionPoints.map((point) => (
                <li key={point} className="flex items-start gap-3 text-sm text-cream/80">
                  <Sprout className="mt-0.5 h-4 w-4 shrink-0 text-saffron" />
                  {point}
                </li>
              ))}
            </ul>
          </div>

          <div className="group rounded-3xl border border-cream/10 bg-cream/5 p-8 transition-all hover:border-saffron/30 hover:bg-cream/10 lg:p-10">
            <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-saffron/20">
              <Eye className="h-7 w-7 text-saffron-light" />
            </div>
            <h3 className="font-display text-2xl font-semibold text-saffron-light">
              Our Vision
            </h3>
            <p className="mt-3 text-cream/70 leading-relaxed">
              To become the most loved Gir cow dairy in Central India — known for purity,
              freshness, and an unforgettable farm experience for every customer.
            </p>
            <ul className="mt-6 space-y-3">
              {visionPoints.map((point) => (
                <li key={point} className="flex items-start gap-3 text-sm text-cream/80">
                  <Sprout className="mt-0.5 h-4 w-4 shrink-0 text-saffron" />
                  {point}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
