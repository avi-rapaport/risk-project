import { MongoClient } from "mongodb";

let client, db;

export async function connectAndGetDb() {
  if (!db) {
    try {
      client = new MongoClient(process.env.MONGO_URI);
      await client.connect();
      console.log("Client connecting to mongo...");
      db = client.db(process.env.MONGODB_NAME);
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
  return db;
}
