import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
if (!uri) throw new Error("❌ MONGODB_URI não está definida!");

let cachedClient = global._mongoClientPromise;

if (!cachedClient) {
  const client = new MongoClient(uri);
  cachedClient = client.connect();
  global._mongoClientPromise = cachedClient;
}

export default cachedClient;