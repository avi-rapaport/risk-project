import { connectAndGetDb } from "../db.js";
import { Collection } from "mongodb";

async function getCollection() {
  const db = await connectAndGetDb();
  /** @type {Collection} */
  const collection = db.collection("map");
  return collection;
}

async function saveMapTerritories(map) {
  const collection = await getCollection();
  const result = await collection.insertOne(map);
  return result.insertedId.toString();
}

export const mapRepo = { saveMapTerritories };
