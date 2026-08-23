export function calculateBattle(sentSoldiers, defendingSoldiers) {
  attackLuck = 0.6 + Math.random() * 0.4;
  defenseLuck = 0.6 + Math.random() * 0.4;

  attackPower = sentSoldiers * attackLuck;
  defensePower = defendingSoldiers * defenseLuck;

  let survivors;
  if (attackPower > defensePower) {
    survivors = Math.max(
      1,
      Math.ceil((sentSoldiers * (attackPower - defensePower)) / attackPower),
    );
  } else {
    survivors = Math.max(
      1,
      Math.ceil(
        (defendingSoldiers * (defensePower - attackPower)) / defensePower,
      ),
    );
  }
  return { survivors };
}
