import { Calendar, MapPin } from "lucide-react";
import { events } from "../../data/content";
import { Button } from "../ui/Button";
import { SectionHeading } from "../ui/SectionHeading";

export function Events() {
  return (
    <section id="events" className="section-padding bg-forest text-cream">
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          eyebrow="Community"
          title="Upcoming Events"
          subtitle="Join us for workshops, sacred ceremonies, and open farm days. Experience the beauty of gau seva firsthand."
          light
        />

        <div className="grid gap-6 md:grid-cols-3">
          {events.map((event) => (
            <article
              key={event.title}
              className="group rounded-3xl border border-cream/10 bg-cream/5 p-6 transition-all hover:border-saffron/30 hover:bg-cream/10"
            >
              <div className="mb-4 flex items-center gap-2 text-sm text-saffron-light">
                <Calendar className="h-4 w-4" />
                {event.date}
              </div>
              <h3 className="font-display text-xl font-semibold text-cream group-hover:text-saffron-light">
                {event.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-cream/70">
                {event.description}
              </p>
              <div className="mt-4 flex items-center gap-2 text-xs text-cream/50">
                <MapPin className="h-3.5 w-3.5" />
                {event.location}
              </div>
            </article>
          ))}
        </div>

        <div className="mt-10 text-center">
          <Button href="#farm-visit" variant="outlineLight">
            Book a Farm Visit
          </Button>
        </div>
      </div>
    </section>
  );
}
