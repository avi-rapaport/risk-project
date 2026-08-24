import { mapRepo } from "../repositories/map.repo.js";
import { gameRepo } from "../repositories/game.repo.js";
import fs from "fs/promises";
import { calculateBattle } from "../utils/utils.battle.js";
import { runComputerTurn } from "./computer.service.js";

function formatGameId(game) {
  const { _id, ...rest } = game;
  return { id: _id.toString(), ...rest };
}

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
    const error = new Error("משחק לא נמצא!");
    error.status = 404;
    throw error;
  }

  if (game.status === "finished") {
    const error = new Error("המשחק כבר הסתיים!");
    error.status = 409;
    throw error;
  }

  return game;
}

async function reinforcePlayer(gameId, territoryId) {
  const game = await getGameById(gameId);
  if (game.status !== "playing" || game.phase !== "reinforce") {
    const error = new Error("המשחק אינו מותאם למצב תגבור!");
    error.status = 400;
    throw error;
  }

  const territory = game.territories.find((t) => t.id === territoryId);
  if (territory.owner !== "player") {
    const error = new Error("הטריטוריה איננה נשלטת על ידי השחקן!");
    error.status = 400;
    throw error;
  }

  territory.soldiers += 3;
  game.phase = "attack";

  await gameRepo.updateGame(gameId, game);

  return {
    game: formatGameId(game),
    playerEvent: { type: "reinforce", territoryId, soldiersAdded: 3 },
    computerEvevts: [],
  };
}

async function playerAttack(gameId, fromId, toId, soldiers) {
  const game = await getGameById(gameId);

  const from = game.territories.find((t) => t.id === fromId);
  const to = game.territories.find((t) => t.id === toId);

  if (game.status !== "playing" || game.phase !== "attack") {
    const error = new Error("המשחק אינו מתאים למצב תקיפה!");
    error.status = 400;
    throw error;
  }

  if (!Number.isInteger(soldiers) || soldiers < 1) {
    const error = new Error("כמות בלתי חוקית של חיילים!");
    error.status = 400;
    throw error;
  }

  if (from.owner !== "player") {
    const error = new Error("הטריטוריה איננה נשלטת על ידי השחקן!");
    error.status = 400;
    throw error;
  }

  if (to.owner !== "computer") {
    const error = new Error("הטריטוריה כבר נמצאת בשליטת השחקן!");
    error.status = 400;
    throw error;
  }

  if (!from.neighbors.includes(to.id)) {
    const error = new Error("השחקן אינו יכול לתקוף טריטוריה שאיננה שכנה!");
    error.status = 400;
    throw error;
  }

  if (from.soldiers - soldiers < 1) {
    const error = new Error("השחקן חייב להשאיר מאחור לפחות חייל אחד");
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
      game.winner = "player";
      game.status = "finished";
    }
  } else {
    to.soldiers = survivors;
    theWinner = "computer";
  }

  game.phase = "move";

  await gameRepo.updateGame(gameId, game);

  return {
    game: formatGameId(game),
    playerEvent: { type: "attack", toId, fromId, soldiers, winner: theWinner },
    computerEvevts: [],
  };
}

async function skipAttack(gameId) {
  const game = await getGameById(gameId);
  if (game.status !== "playing" || game.phase !== "attack") {
    const error = new Error("המשחק אינו במצב תקיפה!");
    error.status = 400;
    throw error;
  }

  game.phase = "move";
  await gameRepo.updateGame(gameId, game);
  return { game, playerEvent: null, computerEvevts: [] };
}

async function playerMove(gameId, fromId, toId, soldiers) {
  const game = await getGameById(gameId);
  const from = game.territories.find((t) => t.id === fromId);
  const to = game.territories.find((t) => t.id === toId);

  if (game.status !== "playing" || game.phase !== "move") {
    const error = new Error("מצב המשחק אינו מתאים להעברה!");
    error.status = 400;
    throw error;
  }

  if (!Number.isInteger(soldiers) || soldiers < 1) {
    const error = new Error("כמות בלתי חוקית של חיילים!");
    error.status = 400;
    throw error;
  }

  if (from.owner !== "player" || to.owner !== "player") {
    const error = new Error("הטריטוריה אינה של השחקן!");
    error.status = 400;
    throw error;
  }

  if (!from.neighbors.includes(to.id)) {
    const error = new Error(
      "שחקן אינו יכול להעביר חיילים לטריטוריות שאינן שכנות!",
    );
    error.status = 400;
    throw error;
  }

  if (from.soldiers - soldiers < 1) {
    const error = new Error("השחקן חייב להשאיר מאחור לפחות חייל אחד");
    error.status = 400;
    throw error;
  }

  if (from === to) {
    const error = new Error("השחקן אינו יכול להזיז לאותו מקום ממנו הוא מעביר!");
    error.status = 400;
    throw error;
  }

  from.soldiers -= soldiers;
  to.soldiers += soldiers;

  const computerEvevts = runComputerTurn(game);
  await gameRepo.updateGame(gameId, game);

  return {
    game: formatGameId(game),
    playerEvent: { type: "move", toId, fromId, soldiers },
    computerEvevts,
  };
}

async function endTurn(gameId) {
  const game = await getGameById(gameId);
  if (game.status !== "playing" || game.phase !== "move") {
    const error = new Error("המשחק אינו במצב העברה!");
    error.status = 400;
    throw error;
  }

  const computerEvevts = runComputerTurn(game);
  await gameRepo.updateGame(gameId, game);

  return {
    game: formatGameId(game),
    playerEvent: null,
    computerEvevts,
  };
}

export const gameService = {
  startGame,
  getGameById,
  reinforcePlayer,
  playerAttack,
  skipAttack,
  playerMove,
  endTurn,
};
