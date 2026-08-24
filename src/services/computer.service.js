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
  playerTerritories.sort((a, b) => {
    a.distanceFromComputerHQ - b.distanceFromComputerHQ;
  });
  const minDistance = playerTerritories[0];
  const isDefence = minDistance <= 2;

  const borderTerritories = [];
  const computerTerritories = game.territories.filter(
    (t) => t.owner === "computer",
  );
  for (const ter of computerTerritories) {
    for (const neighbor of ter.neighbors)
      if (playerTerritories.includes(neighbor)) {
        borderTerritories.push(ter);
        break;
      }
  }

  const checkBorders = borderTerritories.sort((a, b) => {
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

  const toReinforce = checkBorders[0];
  toReinforce.soldiers += 3;

  return { type: "reinforce", territoryId: toReinforce.id, soldiersAdded: 3 };
}

function handleComputerAttack(game) {
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

  const candidates = [];

  for (const from of computerTerritories) {
    for (const neighbor of from.neighbors) {
    }
  }
}

function handleComputerMove(game) {}

const ar = [{ x: 4 }, { x: 2 }, { x: 3 }];

const arr = ar.filter((t) => t.x % 2 === 0);
console.log(arr);
