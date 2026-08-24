import { connectAndGetDb } from "../db.js";
import { Collection, ObjectId } from "mongodb";

const db = await connectAndGetDb();
/** @type {Collection} */
const collection = db.collection("games");

async function saveGameData(data) {
  const result = await collection.insertOne(data);
  return result.insertedId.toString();
}

async function findGameById(id) {
  const result = await collection.findOne({ _id: new ObjectId(id) });
  return result;
}

async function updateGame(gameId, newData) {
  await collection.replaceOne({ _id: new ObjectId(gameId) }, newData);
}

export const gameRepo = { saveGameData, findGameById, updateGame };
