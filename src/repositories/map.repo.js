import { connectAndGetDb } from "../db.js";
import { Collection } from "mongodb";

async function getCollection() {
  const db = await connectAndGetDb();
  /** @type {Collection} */
  const collection = db.collection("maps");
  return collection;
}

async function saveMapTerritories(map) {
  const collection = await getCollection();
  const result = await collection.insertOne(map);
  return result.insertedId.toString();
}

async function getMapByArea(area) {
  const collection = await getCollection();
  const result = await collection.findOne({ area });
  return result;
}

export const mapRepo = { saveMapTerritories, getMapByArea };
