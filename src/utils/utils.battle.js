export function calculateBattle(sentSoldiers, defendingSoldiers) {
  const attackLuck = 0.6 + Math.random() * 0.4;
  const defenseLuck = 0.6 + Math.random() * 0.4;

  const attackPower = sentSoldiers * attackLuck;
  const defensePower = defendingSoldiers * defenseLuck;

  let survivors, winner;
  if (attackPower > defensePower) {
    survivors = Math.max(
      1,
      Math.ceil((sentSoldiers * (attackPower - defensePower)) / attackPower),
    );
    winner = "attacker";
  } else {
    survivors = Math.max(
      1,
      Math.ceil(
        (defendingSoldiers * (defensePower - attackPower)) / defensePower,
      ),
    );
    winner = "defender";
  }
  return { survivors, winner };
}
