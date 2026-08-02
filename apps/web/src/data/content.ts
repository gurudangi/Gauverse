export const siteConfig = {
  name: "Shri Ahilyamata Gaushala",
  tagline: "Pure Gir Cow Dairy · Farm Fresh Daily",
  location: "J M Indore, Madhya Pradesh",
  phone: "+91 98765 43210",
  email: "info@ahilyamatagaushala.org",
  address: "Shri Ahilyamata Gaushala, J M Indore, Madhya Pradesh 452001",
  googleMapsUrl: "https://share.google/LI806xsneCRMUXnpK",
};

export const navLinks = [
  { label: "About", href: "#about" },
  { label: "Our Cows", href: "#cows" },
  { label: "Products", href: "#products" },
  { label: "Donate", href: "#donate" },
  { label: "Subscribe", href: "#subscribe" },
  { label: "Farm Visit", href: "#farm-visit" },
  { label: "Gallery", href: "#gallery" },
  { label: "Contact", href: "#contact" },
];

export const stats = [
  { value: "150+", label: "Gir Cows" },
  { value: "500L", label: "Daily A2 Milk" },
  { value: "2000+", label: "Happy Families" },
  { value: "15+", label: "Years of Service" },
];

export const farmVisitSlots = [
  "7:00 AM — Morning Milking Tour",
  "10:00 AM — Farm Walk & Product Tasting",
  "4:00 PM — Evening Feeding Session",
  "5:30 PM — Sunset Farm Tour",
];

export const farmVisitHighlights = [
  "Meet our Gir cows up close",
  "Watch traditional milking process",
  "Taste fresh A2 milk & ghee samples",
  "Tour organic fodder fields",
  "Buy farm-fresh products on-site",
];

export const cows = [
  {
    name: "Gauri",
    breed: "Gir",
    age: "4 years",
    milk: "12 L/day",
    image:
      "https://images.unsplash.com/photo-1560493676-04071c5f467b?w=600&h=700&fit=crop",
    traits: ["Pure Gir lineage", "A2 certified", "Docile temperament"],
  },
  {
    name: "Lakshmi",
    breed: "Gir",
    age: "5 years",
    milk: "14 L/day",
    image:
      "https://images.unsplash.com/photo-1500595046743-cd271d694d30?w=600&h=700&fit=crop",
    traits: ["Award-winning lineage", "High butterfat", "Excellent health"],
  },
  {
    name: "Radha",
    breed: "Gir",
    age: "3 years",
    milk: "10 L/day",
    image:
      "https://images.unsplash.com/photo-1679798922227-9c4678d2c5a2?w=600&h=700&fit=crop",
    traits: ["Young & healthy", "Organic feed", "Regular vet care"],
  },
  {
    name: "Saraswati",
    breed: "Gir",
    age: "6 years",
    milk: "15 L/day",
    image:
      "https://images.unsplash.com/photo-1604881991720-f8add5f1f50a?w=600&h=700&fit=crop",
    traits: ["Senior matriarch", "Mother of 3 calves", "Gentle nature"],
  },
];

export const products = [
  {
    name: "Fresh A2 Gir Milk",
    price: "₹80/L",
    description: "Pure, unadulterated A2 milk from indigenous Gir cows. Delivered fresh daily.",
    image:
      "https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=500&h=400&fit=crop",
    badge: "Bestseller",
  },
  {
    name: "Desi Ghee",
    price: "₹1,200/kg",
    description: "Traditional bilona method ghee with rich aroma and golden color.",
    image:
      "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500&h=400&fit=crop",
    badge: "Premium",
  },
  {
    name: "Fresh Paneer",
    price: "₹400/kg",
    description: "Soft, chemical-free paneer made from our farm-fresh A2 milk.",
    image:
      "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=500&h=400&fit=crop",
    badge: null,
  },
  {
    name: "Panchgavya Kit",
    price: "₹599",
    description: "Complete Panchgavya set — milk, ghee, curd, dung cakes & urine for rituals.",
    image:
      "https://images.unsplash.com/photo-1550583724-b2692b85b2f9?w=500&h=400&fit=crop",
    badge: "Sacred",
  },
  {
    name: "A2 Curd",
    price: "₹60/200g",
    description: "Thick, probiotic-rich curd set naturally from A2 milk.",
    image:
      "https://images.unsplash.com/photo-1488477181941-7818f194cecd?w=500&h=400&fit=crop",
    badge: null,
  },
  {
    name: "Cow Dung Cakes",
    price: "₹150/10 pcs",
    description: "Sun-dried, eco-friendly dung cakes for havan and organic farming.",
    image:
      "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=500&h=400&fit=crop",
    badge: "Eco",
  },
];

export const events = [
  {
    title: "Weekend Farm Experience",
    date: "Every Saturday & Sunday",
    location: "Dairy Farm Campus",
    description: "Guided tours, fresh product tasting, and a behind-the-scenes look at our Gir cow dairy.",
  },
  {
    title: "Gir Cow & A2 Milk Workshop",
    date: "15 July 2026",
    location: "Farm Auditorium",
    description: "Learn about indigenous Gir breeds, A2 milk benefits, and sustainable dairy farming.",
  },
  {
    title: "First Sunday Open Farm Day",
    date: "First Sunday Monthly",
    location: "Entire Farm",
    description: "Families welcome — milking demo, product shopping, and farm-fresh breakfast.",
  },
];

export const educationTopics = [
  {
    title: "Why Gir Cows Matter",
    description:
      "The Gir breed is India's pride — resilient, high-yielding, and perfectly adapted to our climate.",
    icon: "cow" as const,
  },
  {
    title: "A2 vs A1 Milk",
    description:
      "Scientific insights into A2 beta-casein protein and why Gir cow milk is easier to digest.",
    icon: "milk" as const,
  },
  {
    title: "Panchgavya in Ayurveda",
    description:
      "Discover the five sacred products from cows and their traditional uses in health and farming.",
    icon: "leaf" as const,
  },
  {
    title: "Sustainable Dairy Farming",
    description:
      "How organic gau-based farming creates a zero-waste ecosystem — from biogas to natural fertilizers.",
    icon: "sprout" as const,
  },
];

export const galleryImages = [
  {
    src: "https://images.unsplash.com/photo-1500595046743-cd271d694d30?w=800&h=600&fit=crop",
    alt: "Gir cows grazing peacefully",
  },
  {
    src: "https://images.unsplash.com/photo-1560493676-04071c5f467b?w=800&h=600&fit=crop",
    alt: "Morning milking at the dairy farm",
  },
  {
    src: "https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=800&h=600&fit=crop",
    alt: "Fresh A2 milk collection",
  },
  {
    src: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&h=600&fit=crop",
    alt: "Lush green farm pastures",
  },
  {
    src: "https://images.unsplash.com/photo-1604881991720-f8add5f1f50a?w=800&h=600&fit=crop",
    alt: "Calf with mother cow",
  },
  {
    src: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800&h=600&fit=crop",
    alt: "Traditional ghee preparation",
  },
];

export const testimonials = [
  {
    name: "Priya Sharma",
    role: "Monthly Subscriber, Indore",
    quote:
      "The A2 milk from Ahilyamata Gaushala has transformed our family's health. Pure taste, farm-fresh quality — we trust them completely.",
    rating: 5,
  },
  {
    name: "Rajesh Patidar",
    role: "Regular Customer",
    quote:
      "We visited the farm last month and saw how carefully they raise Gir cows. The ghee and paneer are unmatched in quality.",
    rating: 5,
  },
  {
    name: "Dr. Meena Joshi",
    role: "Nutritionist, Bhopal",
    quote:
      "I recommend their products to all my clients. Authentic Gir cow dairy with zero adulteration — rare to find in today's market.",
    rating: 5,
  },
];

export const blogPosts = [
  {
    title: "The Sacred Bond Between Humans and Cows in Indian Culture",
    excerpt: "Exploring the deep spiritual and practical relationship that has sustained Indian civilization for millennia.",
    date: "12 June 2026",
    readTime: "5 min read",
  },
  {
    title: "5 Health Benefits of A2 Gir Cow Milk",
    excerpt: "From better digestion to stronger immunity — science-backed reasons to switch to indigenous cow milk.",
    date: "28 May 2026",
    readTime: "4 min read",
  },
  {
    title: "A Day in the Life at Our Gir Cow Dairy Farm",
    excerpt: "Follow our team through dawn milking, organic feeding, and preparing farm-fresh products for delivery.",
    date: "10 May 2026",
    readTime: "6 min read",
  },
];
