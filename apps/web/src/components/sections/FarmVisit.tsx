import { useState } from "react";
import { CalendarCheck, Check, Clock, Loader2, MapPin, Navigation, Send, Users } from "lucide-react";
import { useToast } from "../../contexts/ToastContext";
import { farmVisitHighlights, farmVisitSlots, siteConfig } from "../../data/content";
import { api } from "../../lib/api";
import { Button } from "../ui/Button";
import { SectionHeading } from "../ui/SectionHeading";

export function FarmVisit() {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    date: "",
    guests: 2,
    timeSlot: "",
    notes: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.bookFarmVisit({
        name: form.name,
        phone: form.phone,
        date: form.date,
        guests: form.guests,
        timeSlot: form.timeSlot,
        notes: form.notes || undefined,
      });
      showToast(res.message ?? "Farm visit booked successfully!");
      setForm({ name: "", phone: "", date: "", guests: 2, timeSlot: "", notes: "" });
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Booking failed", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="farm-visit" className="section-padding bg-cream-dark/40">
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          eyebrow="Visit Us"
          title="Book a Farm Visit"
          subtitle="Experience our Gir cow dairy firsthand — see where your milk comes from, meet our cows, and taste farm-fresh products."
        />

        <div className="grid gap-12 lg:grid-cols-2">
          <div>
            <div className="overflow-hidden rounded-3xl shadow-xl">
              <img
                src="https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&h=500&fit=crop"
                alt="Gir cow dairy farm visit"
                className="aspect-[16/10] w-full object-cover"
              />
            </div>

            <div className="mt-6 rounded-2xl bg-cream p-6 shadow-sm">
              <h3 className="font-display text-xl font-semibold text-forest">What to Expect</h3>
              <ul className="mt-4 space-y-3">
                {farmVisitHighlights.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm text-muted">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-saffron" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="flex items-center gap-3 rounded-2xl bg-cream p-4 shadow-sm">
                <Clock className="h-5 w-5 text-saffron" />
                <div>
                  <p className="text-xs font-medium text-muted">Duration</p>
                  <p className="text-sm font-semibold text-forest">1.5 – 2 hours</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-2xl bg-cream p-4 shadow-sm">
                <Users className="h-5 w-5 text-saffron" />
                <div>
                  <p className="text-xs font-medium text-muted">Group Size</p>
                  <p className="text-sm font-semibold text-forest">Up to 15 guests</p>
                </div>
              </div>
            </div>
          </div>

          <form className="glass-card space-y-5 p-8" onSubmit={handleSubmit}>
            <div className="mb-2 flex items-center gap-2 text-forest">
              <CalendarCheck className="h-5 w-5 text-saffron" />
              <h3 className="font-display text-xl font-semibold">Request Appointment</h3>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="visit-name" className="mb-1.5 block text-sm font-medium text-forest">
                  Full Name
                </label>
                <input
                  id="visit-name"
                  type="text"
                  placeholder="Your name"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full rounded-xl border border-forest/10 bg-cream px-4 py-3 text-sm text-forest outline-none transition-colors focus:border-forest/30 focus:ring-2 focus:ring-forest/10"
                />
              </div>
              <div>
                <label htmlFor="visit-phone" className="mb-1.5 block text-sm font-medium text-forest">
                  Phone
                </label>
                <input
                  id="visit-phone"
                  type="tel"
                  placeholder="+91"
                  required
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full rounded-xl border border-forest/10 bg-cream px-4 py-3 text-sm text-forest outline-none transition-colors focus:border-forest/30 focus:ring-2 focus:ring-forest/10"
                />
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="visit-date" className="mb-1.5 block text-sm font-medium text-forest">
                  Preferred Date
                </label>
                <input
                  id="visit-date"
                  type="date"
                  required
                  min={new Date().toISOString().split("T")[0]}
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  className="w-full rounded-xl border border-forest/10 bg-cream px-4 py-3 text-sm text-forest outline-none transition-colors focus:border-forest/30 focus:ring-2 focus:ring-forest/10"
                />
              </div>
              <div>
                <label htmlFor="visit-guests" className="mb-1.5 block text-sm font-medium text-forest">
                  Number of Guests
                </label>
                <input
                  id="visit-guests"
                  type="number"
                  min={1}
                  max={15}
                  required
                  value={form.guests}
                  onChange={(e) => setForm({ ...form, guests: Number(e.target.value) })}
                  className="w-full rounded-xl border border-forest/10 bg-cream px-4 py-3 text-sm text-forest outline-none transition-colors focus:border-forest/30 focus:ring-2 focus:ring-forest/10"
                />
              </div>
            </div>

            <div>
              <label htmlFor="visit-slot" className="mb-1.5 block text-sm font-medium text-forest">
                Preferred Time Slot
              </label>
              <select
                id="visit-slot"
                required
                value={form.timeSlot}
                onChange={(e) => setForm({ ...form, timeSlot: e.target.value })}
                className="w-full rounded-xl border border-forest/10 bg-cream px-4 py-3 text-sm text-forest outline-none transition-colors focus:border-forest/30 focus:ring-2 focus:ring-forest/10"
              >
                <option value="" disabled>
                  Select a time slot
                </option>
                {farmVisitSlots.map((slot) => (
                  <option key={slot} value={slot}>
                    {slot}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="visit-notes" className="mb-1.5 block text-sm font-medium text-forest">
                Special Requests (optional)
              </label>
              <textarea
                id="visit-notes"
                rows={3}
                placeholder="Product purchase, kids tour, photography, etc."
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                className="w-full resize-none rounded-xl border border-forest/10 bg-cream px-4 py-3 text-sm text-forest outline-none transition-colors focus:border-forest/30 focus:ring-2 focus:ring-forest/10"
              />
            </div>

            <Button type="submit" variant="primary" className="w-full" disabled={loading}>
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              {loading ? "Booking…" : "Book Farm Visit"}
            </Button>
          </form>
        </div>

        <div className="mt-14 overflow-hidden rounded-3xl shadow-xl">
          <div className="flex flex-col gap-4 bg-forest p-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3 text-cream">
              <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-saffron" />
              <div>
                <p className="font-semibold">How to Reach Us</p>
                <p className="mt-1 text-sm text-cream/70">{siteConfig.address}</p>
              </div>
            </div>
            <a
              href={siteConfig.googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-saffron px-6 py-3 text-sm font-semibold text-forest-dark transition-colors hover:bg-saffron-light"
            >
              <Navigation className="h-4 w-4" />
              Open in Google Maps
            </a>
          </div>
          <iframe
            title="Farm location on Google Maps"
            src={`https://maps.google.com/maps?q=${encodeURIComponent(siteConfig.googleMapsUrl)}&hl=en&z=16&output=embed`}
            className="h-80 w-full border-0 sm:h-96"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
          />
        </div>
      </div>
    </section>
  );
}
