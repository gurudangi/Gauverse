export function getMongoUri(): string {
  const uri = process.env.MONGODB_URI?.trim();
  const dbName = process.env.MONGODB_DB_NAME ?? "gauverse";

  if (!uri) {
    throw new Error(
      "MONGODB_URI is required. Copy .env.example to .env and set your credentials.",
    );
  }

  if (/\.mongodb\.net\/[^/]/.test(uri)) {
    return uri;
  }

  return `${uri.replace(/\/$/, "")}/${dbName}?retryWrites=true&w=majority`;
}
