const DEFAULT_ORIGINS = [
  "http://localhost:5180",
  "http://localhost:5181",
  "http://localhost:5182",
  "http://localhost:5183",
  "http://localhost:5184",
  "http://localhost:5185",
  "http://127.0.0.1:5180",
  "http://127.0.0.1:5181",
  "http://127.0.0.1:5182",
  "http://127.0.0.1:5183",
  "http://127.0.0.1:5184",
  "http://127.0.0.1:5185",
];

/** Origins allowed for browser clients (Vite may bump ports when 5180 is busy). */
export function getCorsOrigins(): string[] {
  const fromEnv = process.env.CORS_ORIGINS?.split(",")
    .map((o) => o.trim())
    .filter(Boolean);

  return [...new Set([...(fromEnv ?? []), ...DEFAULT_ORIGINS])];
}
