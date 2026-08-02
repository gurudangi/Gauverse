import dns from "node:dns";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import { getMongoUri } from "../config/env.js";

// Windows corporate DNS often refuses Node SRV lookups for mongodb+srv.
dns.setServers(["8.8.8.8", "1.1.1.1"]);

/** Fail buffered ops instead of hanging forever when Mongo is unreachable. */
mongoose.set("bufferTimeoutMS", 10_000);

const CONNECT_OPTIONS: mongoose.ConnectOptions = {
  serverSelectionTimeoutMS: 8_000,
  connectTimeoutMS: 10_000,
  socketTimeoutMS: 20_000,
  maxPoolSize: 10,
};

async function connectMemoryDb(): Promise<void> {
  const memoryServer = await MongoMemoryServer.create();
  await mongoose.connect(memoryServer.getUri("gauverse"), CONNECT_OPTIONS);
  console.log("Connected to in-memory MongoDB");
}

export async function connectDb(): Promise<void> {
  const hasUri = Boolean(process.env.MONGODB_URI?.trim());

  if (!hasUri) {
    console.warn(
      "MONGODB_URI not set; starting in-memory MongoDB for local development.",
    );
    await connectMemoryDb();
    return;
  }

  try {
    await mongoose.connect(getMongoUri(), CONNECT_OPTIONS);
    console.log("Connected to MongoDB");
  } catch (err) {
    console.warn(
      "Remote MongoDB unavailable; starting in-memory MongoDB for local development.",
    );
    console.warn(err instanceof Error ? err.message : err);
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect().catch(() => undefined);
    }
    await connectMemoryDb();
  }
}

export function isDbConnected(): boolean {
  return mongoose.connection.readyState === 1;
}
