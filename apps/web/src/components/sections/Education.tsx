import { BookOpen, Droplets, Leaf, Sprout } from "lucide-react";
import { educationTopics } from "../../data/content";
import { Button } from "../ui/Button";
import { SectionHeading } from "../ui/SectionHeading";

const iconMap = {
  cow: Leaf,
  milk: Droplets,
  leaf: Sprout,
  sprout: BookOpen,
};

export function Education() {
  return (
    <section id="education" className="section-padding">
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          eyebrow="Learn"
          title="Gir Cow Awareness & Education"
          subtitle="Knowledge is the first step toward conservation. Explore articles and resources about indigenous cattle, A2 milk science, and sustainable farming."
        />

        <div className="grid gap-6 sm:grid-cols-2">
          {educationTopics.map((topic) => {
            const Icon = iconMap[topic.icon];
            return (
              <article
                key={topic.title}
                className="group flex gap-5 rounded-3xl border border-forest/5 bg-cream p-6 shadow-sm transition-all hover:border-saffron/20 hover:shadow-lg"
              >
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-forest/5 transition-colors group-hover:bg-saffron/15">
                  <Icon className="h-7 w-7 text-forest transition-colors group-hover:text-saffron" />
                </div>
                <div>
                  <h3 className="font-display text-xl font-semibold text-forest">
                    {topic.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">
                    {topic.description}
                  </p>
                </div>
              </article>
            );
          })}
        </div>

        <div className="mt-10 text-center">
          <Button href="#blog" variant="outline">
            <BookOpen className="h-4 w-4" />
            Read All Articles
          </Button>
        </div>
      </div>
    </section>
  );
}
