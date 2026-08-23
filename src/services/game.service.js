import { mapRepo } from "../repositories/map.repo.js";
import { gameRepo } from "../repositories/game.repo.js";
import fs from "fs/promises";
import { calculateBattle } from "../utils/utils.battle.js";

async function startGame(playerName) {
  if (!playerName.trim()) {
    const error = new Error("Invalid or missing playerName");
    error.status = 400;
    throw error;
  }

  let map = await mapRepo.getMapByArea("middleEast");
  let territories;

  if (!map) {
    const mapFile = await fs.readFile("src/services/map.json", "utf8");
    territories = JSON.parse(mapFile);
    mapRepo.saveMapTerritories({ area: "middleEast", territories });
  } else {
    territories = map.territories;
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
    const error = new Error("Game not found1");
    error.status = 404;
    throw error;
  }

  if (game.status === "finished") {
    const error = new Error("Game already finished!");
    error.status = 409;
    throw error;
  }

  return game;
}

async function reinforcePlayer(gameId, territoryId) {
  const game = await getGameById(gameId);
  if (game.status !== "playing" || game.phase !== "reinforce") {
    const error = new Error("Game is not suitable for reinforcing!");
    error.status = 400;
    throw error;
  }

  const territory = game.territories.find((t) => t.id === territoryId);
  if (territory.owner !== "player") {
    const error = new Error("Territory is not owned by the player!");
    error.status = 400;
    throw error;
  }

  territory.soldiers += 3;
  game.phase = "attack";

  await gameRepo.updateGame(gameId, game);

  return {
    ...game,
    playerEvent: { type: "reinforce", territoryId, soldiersAdded: 3 },
    computerEvevts: [],
  };
}

async function playerAttack(gameId, fromId, toId, soldiers) {
  const game = await getGameById(gameId);
  //   if (skip) {
  //     game.phase = "move";
  //     await gameRepo.updateGame(gameId, game);
  //     return { ...game, playerEvent: null, computerEvevts: [] };
  //   }

  const from = game.territories.find((t) => t.id === fromId);
  const to = game.territories.find((t) => t.id === toId);

  if (game.status !== "playing" || game.phase !== "attack") {
    const error = new Error("Game is not suitable for attacking!");
    error.status = 400;
    throw error;
  }

  if (!Number.isInteger(soldiers) || soldiers < 1) {
    const error = new Error("Invalid amount of soldiers!");
    error.status = 400;
    throw error;
  }

  if (from.owner !== "player") {
    const error = new Error("Territory is not owned by the player!");
    error.status = 400;
    throw error;
  }

  if (to.owner !== "compuetr") {
    const error = new Error("player already owned this territory!");
    error.status = 400;
    throw error;
  }

  if (!from.neighbors.includes(to.id)) {
    const error = new Error(
      "Player cannot attack a territory that is not neighboring!",
    );
    error.status = 400;
    throw error;
  }

  if (from.soldiers - soldiers < 1) {
    const error = new Error("player must leave at least one soldier behind!");
    error.status = 400;
    throw error;
  }

  from.soldiers -= soldiers;

  const { survivors, winner } = calculateBattle(soldiers, to.soldiers);
  let theWinner;

  if (winner === "attacker") {
    to.soldiers = survivors;
    to.owner = "player";
    theWinner = "player";

    if (to.headquarters) {
      game.status = "finished";
      game.winner = "player";
    }
  } else {
    to.soldiers = survivors;
    theWinner = "computer";
  }

  game.phase = "move";

  await gameRepo.updateGame(gameId, game);

  return {
    ...game,
    playerEvent: { type: "attack", toId, fromId, soldiers, winner: theWinner },
    computerEvevts: [],
  };
}

async function playerMove(gameId, fromId, toId, soldiers) {
  const game = await getGameById(gameId);
  const from = game.territories.find((t) => t.id === fromId);
  const to = game.territories.find((t) => t.id === toId);

  if (game.status !== "playing" || game.phase !== "move") {
    const error = new Error("Game is not suitable for moving!");
    error.status = 400;
    throw error;
  }

  if (!Number.isInteger(soldiers) || soldiers < 1) {
    const error = new Error("Invalid amount of soldiers!");
    error.status = 400;
    throw error;
  }

  if (from.owner !== "player" || to.owner !== "player") {
    const error = new Error("Territory is not owned by the player!");
    error.status = 400;
    throw error;
  }

  if (!from.neighbors.includes(to.id)) {
    const error = new Error(
      "Player cannot move to a territory that is not neighboring!",
    );
    error.status = 400;
    throw error;
  }

  if (from.soldiers - soldiers < 1) {
    const error = new Error("player must leave at least one soldier behind!");
    error.status = 400;
    throw error;
  }

  from.soldiers -= soldiers;
  to.soldiers += soldiers;
  game.phase = "reinforce";
  game.round += 1;

  await gameRepo.updateGame(gameId, game);

  return {
    ...game,
    playerEvent: { type: "move", toId, fromId, soldiers },
    computerEvevts: [],
  };
}

export const gameService = {
  startGame,
  getGameById,
  reinforcePlayer,
  playerAttack,
  playerMove,
};
