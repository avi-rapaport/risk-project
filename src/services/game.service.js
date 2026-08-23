import { mapRepo } from "../repositories/map.repo.js";
import { gameRepo } from "../repositories/game.repo.js";
import fs from "fs/promises";
import "dotenv/config";

async function startGame(playerName) {
  if (!playerName.trim()) {
    const error = new Error("Invalid or missing playerName");
    error.status = 400;
    throw error;
  }

  let territories = await mapRepo.getMapByArea("middleEast");
  if (!territories) {
    const map = await fs.readFile("src/services/map.json", "utf8");
    territories = JSON.parse(map);
    mapRepo.saveMapTerritories({ area: "middleEas", territories });
  }

  territories.map((ter) => {
    if (ter.startOwner === "player") {
      ter.owner = "player";
    } else {
      ter.owner = "computer";
    }

    if (ter.headquarters) {
      ter.soldiers = 8;
    } else {
      ter.soldiers = 4;
    }
  });

  const gameData = {
    playerName,
    round: 1,
    phase: "reinforce",
    status: "playing",
    winner: null,
    territories,
  };

  const gameId = await gameRepo.saveGameData(gameData);
  return { id: gameId, ...gameData };
}

async function getGameById(id) {
  const game = await gameRepo.findGameById(id);
  if (!game) {
    const error = new Error("Game not found");
    error.status = 404;
    throw error;
  }

  return game;
}

export const gameService = { startGame, getGameById };
