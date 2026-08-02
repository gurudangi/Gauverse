import { ArrowRight, Clock } from "lucide-react";
import { blogPosts } from "../../data/content";
import { SectionHeading } from "../ui/SectionHeading";

export function BlogPreview() {
  return (
    <section id="blog" className="section-padding bg-cream-dark/40">
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          eyebrow="Blog"
          title="Stories from the Gaushala"
          subtitle="Insights, education, and updates from our farm — celebrating the sacred bond between humans and cows."
        />

        <div className="grid gap-8 md:grid-cols-3">
          {blogPosts.map((post, index) => (
            <article
              key={post.title}
              className="group flex flex-col overflow-hidden rounded-3xl bg-cream shadow-md transition-all hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="relative h-48 overflow-hidden bg-forest/10">
                <img
                  src={`https://images.unsplash.com/photo-${index === 0 ? "1500595046743-cd271d694d30" : index === 1 ? "1628088062854-d1870b4553da" : "1416879595882-3373a0480b5b"}?w=600&h=400&fit=crop`}
                  alt=""
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="flex flex-1 flex-col p-6">
                <div className="mb-3 flex items-center gap-3 text-xs text-muted">
                  <span>{post.date}</span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {post.readTime}
                  </span>
                </div>
                <h3 className="font-display text-xl font-semibold text-forest group-hover:text-forest-light">
                  {post.title}
                </h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">
                  {post.excerpt}
                </p>
                <a
                  href="#"
                  className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-saffron hover:text-earth"
                >
                  Read More
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </a>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
