import { connectAndGetDb } from "../db.js";
import { Collection } from "mongodb";

const db = await connectAndGetDb();
/** @type {Collection} */
const collection = db.collection("maps");

async function saveMapTerritories(map) {
  const result = await collection.insertOne(map);
  return result.insertedId.toString();
}

async function getMapByArea(area) {
  const result = await collection.findOne({ area });
  return result;
}

export const mapRepo = { saveMapTerritories, getMapByArea };
