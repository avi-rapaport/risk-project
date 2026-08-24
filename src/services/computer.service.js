import { calculateBattle } from "../utils/utils.battle.js";

export async function runComputerTurn(game) {
  const computerEvevts = [];

  const reinforceEvent = handleComputerReinforce(game);
  computerEvevts.push(reinforceEvent);

  const attackEvent = handleComputerAttack(game);
  if (attackEvent) {
    computerEvevts.push(attackEvent);
    if (game.status === "finished") {
      return computerEvevts;
    }
  }

  const moveEvent = handleComputerMove(game);
  if (moveEvent) {
    computerEvevts.push(moveEvent);
  }

  game.phase = "reinforce";
  game.round += 1;

  return computerEvevts;
}

function handleComputerReinforce(game) {
  const playerTerritories = game.territories.filter(
    (t) => t.owner === "player",
  );
  const minDistance = Math.min(
    ...playerTerritories.map((t) => t.distanceFromComputerHQ),
  );
  const isDefence = minDistance <= 2;

  const borderTerritories = [];
  const computerTerritories = game.territories.filter(
    (t) => t.owner === "computer",
  );
  for (const ter of computerTerritories) {
    for (const neighbor of ter.neighbors)
      if (playerTerritories.map((t) => t.id).includes(neighbor)) {
        borderTerritories.push(ter);
        break;
      }
  }

  const sortBorders = borderTerritories.sort((a, b) => {
    if (isDefence) {
      if (a.distanceFromComputerHQ !== b.distanceFromComputerHQ) {
        return a.distanceFromComputerHQ - b.distanceFromComputerHQ;
      } else if (a.soldiers !== b.soldiers) {
        return a.soldiers - b.soldiers;
      } else {
        return a.id - b.id;
      }
    } else {
      if (a.distanceFromPlayerHQ !== b.distanceFromPlayerHQ) {
        return a.distanceFromPlayerHQ - b.distanceFromPlayerHQ;
      } else if (a.soldiers !== b.soldiers) {
        return b.soldiers - a.soldiers;
      } else {
        return a.id - b.id;
      }
    }
  });

  const toReinforce = sortBorders[0];
  toReinforce.soldiers += 3;

  return { type: "reinforce", territoryId: toReinforce.id, soldiersAdded: 3 };
}

function handleComputerAttack(game) {
  const candidates = [];

  for (const from of game.territories) {
    if (from.owner !== "computer" || from.soldiers < 1) {
      continue;
    }

    for (const nId of from.neighbors) {
      const to = game.territories.find((t) => t.id === nId);
      if (!to || to.owner === "computer") {
        continue;
      }

      const sentSoldiers = from.soldiers - 1;
      const advantageRatio = sentSoldiers / to.soldiers;

      const isHQattack = to.headquarters && sentSoldiers > to.soldiers;
      const isRegolarAttack = !to.headquarters && advantageRatio >= 1.35;

      if (isHQattack || isRegolarAttack) {
        const progress =
          (from.distanceFromPlayerHQ - to.distanceFromPlayerHQ) * 10;
        const soldierAdvantage = sentSoldiers - to.soldiers;
        const protectsHeadquarters =
          Math.max(0, 3 - to.distanceFromComputerHQ) * 25;
        const headquartersScore = to.headquarters ? 1000 : 0;

        const score =
          progress +
          soldierAdvantage +
          protectsHeadquarters +
          headquartersScore;

        candidates.push({ from, to, sentSoldiers, score });
      }
    }
  }

  if (candidates.length === 0) {
    return null;
  }

  const sortAttacks = candidates.sort((a, b) => {
    if (a.score !== b.score) {
      return b.score - a.score;
    } else if (a.to.id !== b.to.id) {
      return a.to.id - b.to.id;
    } else {
      return a.from.id - b.from.id;
    }
  });

  const bestAttack = sortAttacks[0];
  bestAttack.from.soldiers - bestAttack.sentSoldiers;

  const { survivors, winner } = calculateBattle(
    bestAttack.sentSoldiers,
    bestAttack.to.soldiers,
  );
  let theWinner = "computer";

  if (winner === "attacker") {
    bestAttack.to.soldiers = survivors;
    bestAttack.to.owner = "computer";

    if (bestAttack.to.headquarters) {
      game.winner = "computer";
      game.status = "finished";
    }
  } else {
    bestAttack.to.soldiers = survivors;
    winner = "player";
  }

  return {
    type: "attack",
    toId: bestAttack.to.id,
    fromId: bestAttack.from.id,
    soldiers: bestAttack.sentSoldiers,
    winner: theWinner,
  };
}

function handleComputerMove(game) {
  const playerTerritories = game.territories.filter(
    (t) => t.owner === "player",
  );

  const minDistance = Math.min(...playerTerritories.map((t) => t.id));
  const isDefence = minDistance <= 2;

  let candidates = [];

  for (const from of game.territories) {
    let minimum = from.headquarters ? 4 : 1;
    if (from.owner !== "computer" || from.soldiers < minimum) {
      continue;
    }

    if (
      from.neighbors.some((nId) => {
        playerTerritories.map((t) => t.id).includes(nId);
      })
    ) {
      continue;
    }

    for (const nId of from.neighbors) {
      const to = game.territories.find((t) => t.id === nId);
      if (!to || to.owner === "player") {
        continue;
      }

      if (isDefence) {
        if (to.distanceFromComputerHQ >= from.distanceFromComputerHQ) {
          continue;
        }
      } else {
        if (to.distanceFromPlayerHQ >= from.distanceFromPlayerHQ) {
          continue;
        }
      }

      candidates.push({ from, to });
    }
  }

  if (candidates.length === 0) {
    return null;
  }

  const sortCandidates = candidates.sort((a, b) => {
    if (a.to.soldiers !== b.to.soldiers) {
      return a.to.soldiers - b.to.soldiers;
    } else if (a.to.id !== b.to.id) {
      return a.to.id - b.to.id;
    } else {
      return a.from.id - b.from.id;
    }
  });

  const toMove = sortCandidates[0];

  const sentSoldiers = toMove.from.headquarters
    ? toMove.from.soldiers - 4
    : toMove.from.soldiers - 1;

  toMove.from.soldiers -= sentSoldiers;
  toMove.to.soldiers += sentSoldiers;

  return {
    type: "move",
    toId: toMove.to.id,
    fromId: toMove.from.id,
    soldiers: sentSoldiers,
  };
}

export const computerService = {
  handleComputerReinforce,
  handleComputerAttack,
  handleComputerMove,
};
