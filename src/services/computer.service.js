import { router } from "../routes/game.route";

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
  const sortedTerritories = playerTerritories.sort((a, b) => {
    a.distanceFromComputerHQ - b.distanceFromComputerHQ;
  });
  const minDistance = sortedTerritories[0];
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
  const computerTerritories = game.territories.filter(
    (t) => t.owner === "computer",
  );
  const playerTerritories = game.territories.filter(
    (t) => t.owner === "player",
  );

  const candidates = [];

  if (!candidates) {
    return;
  }

  return { type: "attack" };
}

function handleComputerMove(game) {
  const playerTerritories = game.territories.filter(
    (t) => t.owner === "player",
  );
  playerTerritories.sort((a, b) => {
    a.distanceFromComputerHQ - b.distanceFromComputerHQ;
  });
  const minDistance = playerTerritories[0];
  const isDefence = minDistance <= 2;
  const computerTerritories = game.territories.filter(
    (t) => t.owner === "computer",
  );

  let candidates = [];

  for (const from of computerTerritories) {
    let min = 1;
    if (from.headquarters) {
      min = 4;
    }

    if (
      from.soldiers > min &&
      from.neighbors.every((nId) => {
        !playerTerritories.map((t) => t.id).includes(nId);
      })
    ) {
      for (const neighbor of ter.neighbors) {
        const to = computerTerritories.find((t) => t.id === neighbor);
        if (to) {
          const move = { from, to };
          candidates.push(move);
        } else {
          continue;
        }
      }
    } else {
      continue;
    }
  }

  if (!candidates) {
    return;
  }

  if (isDefence) {
    candidates = candidates.filter((move) => {
      move.to.distanceFromComputerHQ < move.from.distanceFromComputerHQ;
    });
  } else {
    candidates = candidates.filter((move) => {
      move.to.distanceFromPlayerHQ < move.from.distanceFromPlayerHQ;
    });
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

  const sentSoldiers = toMove.from.headquarters
    ? toMove.from.soldiers - 4
    : toMove.from.soldiers - 1;

  const toMove = sortCandidates[0];

  toMove.from.soldiers -= sentSoldiers;
  toMove.to.soldiers += sentSoldiers;

  return {
    type: "move",
    toId: toMove.to.id,
    fromId: toMove.from.id,
    soldiers: sentSoldiers,
  };
}
