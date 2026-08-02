import { Star } from "lucide-react";
import { testimonials } from "../../data/content";
import { SectionHeading } from "../ui/SectionHeading";

export function Testimonials() {
  return (
    <section id="testimonials" className="section-padding">
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          eyebrow="Testimonials"
          title="Trusted by Families Across MP"
          subtitle="Hear from our customers who shop our products and visit our farm."
        />

        <div className="grid gap-8 md:grid-cols-3">
          {testimonials.map((testimonial) => (
            <blockquote
              key={testimonial.name}
              className="relative rounded-3xl border border-forest/5 bg-cream p-8 shadow-md"
            >
              <div className="mb-4 flex gap-1">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-saffron text-saffron" />
                ))}
              </div>
              <p className="text-muted leading-relaxed">&ldquo;{testimonial.quote}&rdquo;</p>
              <footer className="mt-6 border-t border-forest/5 pt-4">
                <p className="font-semibold text-forest">{testimonial.name}</p>
                <p className="text-sm text-muted">{testimonial.role}</p>
              </footer>
              <span className="absolute right-6 top-6 font-display text-6xl leading-none text-saffron/15">
                &ldquo;
              </span>
            </blockquote>
          ))}
        </div>
      </div>
    </section>
  );
}
