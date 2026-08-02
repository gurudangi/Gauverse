import { useState } from "react";
import { Loader2, Mail, MapPin, Navigation, Phone, Send } from "lucide-react";
import { useToast } from "../../contexts/ToastContext";
import { siteConfig } from "../../data/content";
import { api } from "../../lib/api";
import { Button } from "../ui/Button";
import { SectionHeading } from "../ui/SectionHeading";

export function Contact() {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.subject) {
      showToast("Please select a subject", "error");
      return;
    }
    setLoading(true);
    try {
      const res = await api.sendContact(form);
      showToast(res.message ?? "Message sent successfully!");
      setForm({ name: "", phone: "", email: "", subject: "", message: "" });
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to send message", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="contact" className="section-padding">
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          eyebrow="Get in Touch"
          title="Contact Our Dairy Farm"
          subtitle="Questions about products, delivery, or your farm visit? We're here to help."
        />

        <div className="grid gap-12 lg:grid-cols-5">
          <div className="space-y-6 lg:col-span-2">
            {[
              {
                icon: MapPin,
                title: "Address",
                content: siteConfig.address,
                href: siteConfig.googleMapsUrl,
                external: true,
              },
              {
                icon: Phone,
                title: "Phone",
                content: siteConfig.phone,
                href: `tel:${siteConfig.phone.replace(/\s/g, "")}`,
              },
              {
                icon: Mail,
                title: "Email",
                content: siteConfig.email,
                href: `mailto:${siteConfig.email}`,
              },
            ].map(({ icon: Icon, title, content, href, external }) => (
              <div key={title} className="flex gap-4 rounded-2xl bg-cream-dark/50 p-5">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-forest/5">
                  <Icon className="h-5 w-5 text-forest" />
                </div>
                <div>
                  <h4 className="font-semibold text-forest">{title}</h4>
                  {href ? (
                    <a
                      href={href}
                      target={external ? "_blank" : undefined}
                      rel={external ? "noopener noreferrer" : undefined}
                      className="mt-1 text-sm text-muted hover:text-forest"
                    >
                      {content}
                    </a>
                  ) : (
                    <p className="mt-1 text-sm text-muted">{content}</p>
                  )}
                </div>
              </div>
            ))}

            <a
              href={siteConfig.googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 rounded-2xl bg-forest px-5 py-4 text-sm font-semibold text-cream transition-colors hover:bg-forest-light"
            >
              <Navigation className="h-4 w-4" />
              Get Directions on Google Maps
            </a>
          </div>

          <form
            className="glass-card space-y-5 p-8 lg:col-span-3"
            onSubmit={handleSubmit}
          >
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-forest">
                  Full Name
                </label>
                <input
                  id="name"
                  type="text"
                  placeholder="Your name"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full rounded-xl border border-forest/10 bg-cream px-4 py-3 text-sm text-forest outline-none transition-colors focus:border-forest/30 focus:ring-2 focus:ring-forest/10"
                />
              </div>
              <div>
                <label htmlFor="phone" className="mb-1.5 block text-sm font-medium text-forest">
                  Phone
                </label>
                <input
                  id="phone"
                  type="tel"
                  placeholder="+91"
                  required
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full rounded-xl border border-forest/10 bg-cream px-4 py-3 text-sm text-forest outline-none transition-colors focus:border-forest/30 focus:ring-2 focus:ring-forest/10"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-forest">
                Email
              </label>
              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full rounded-xl border border-forest/10 bg-cream px-4 py-3 text-sm text-forest outline-none transition-colors focus:border-forest/30 focus:ring-2 focus:ring-forest/10"
              />
            </div>

            <div>
              <label htmlFor="subject" className="mb-1.5 block text-sm font-medium text-forest">
                Subject
              </label>
              <select
                id="subject"
                required
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
                className="w-full rounded-xl border border-forest/10 bg-cream px-4 py-3 text-sm text-forest outline-none transition-colors focus:border-forest/30 focus:ring-2 focus:ring-forest/10"
              >
                <option value="" disabled>
                  Select a topic
                </option>
                <option>Product Inquiry</option>
                <option>Place an Order</option>
                <option>Milk Subscription</option>
                <option>Farm Visit Booking</option>
                <option>Delivery Question</option>
                <option>Other</option>
              </select>
            </div>

            <div>
              <label htmlFor="message" className="mb-1.5 block text-sm font-medium text-forest">
                Message
              </label>
              <textarea
                id="message"
                rows={4}
                placeholder="How can we help you?"
                required
                minLength={5}
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                className="w-full resize-none rounded-xl border border-forest/10 bg-cream px-4 py-3 text-sm text-forest outline-none transition-colors focus:border-forest/30 focus:ring-2 focus:ring-forest/10"
              />
            </div>

            <Button type="submit" variant="primary" className="w-full sm:w-auto" disabled={loading}>
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              {loading ? "Sending…" : "Send Message"}
            </Button>
          </form>
        </div>
      </div>
    </section>
  );
}
