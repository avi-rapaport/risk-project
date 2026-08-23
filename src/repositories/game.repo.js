import { connectAndGetDb } from "../db.js";
import { Collection, ObjectId } from "mongodb";

async function getCollection() {
  const db = await connectAndGetDb();
  /** @type {Collection} */
  const collection = db.collection("games");
  return collection;
}

async function saveGameData(data) {
  const collection = await getCollection();
  const result = await collection.insertOne(data);
  return result.insertedId.toString();
}

async function findGameById(id) {
  const collection = await getCollection();
  const result = await collection.findOne({ _id: new ObjectId(id) });
  return result;
}

async function updateGame(gameId, newData) {
  const collection = await getCollection();
  await collection.replaceOne({ _id: new ObjectId(gameId) }, newData);
}

export const gameRepo = { saveGameData, findGameById, updateGame };
