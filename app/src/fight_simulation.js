// Function to simulate a turn in battle



function takeTurn(attacker, defender) {
  const specialPowerEffect = attacker.specialAttackEffect;

  // Calculate the specialThreshold based on the attacker's special power effect
  const specialThreshold = 1 - specialPowerEffect;

  if (defender.health / defender.maxHealth <= specialThreshold) {
    // Use special attack if defender's health is below the threshold
    console.log(`${attacker.name} uses special attack ${attacker.specialAttack} on ${defender.name}!`);
    const specialDamage = calculateSpecialDamage(attacker, defender);
    console.log(`It deals ${specialDamage} damage.`);
    defender.health -= specialDamage;

    // Check if the special attack knocked out the defender
    if (defender.health <= 0) {
      console.log(`${defender.name} has been knocked out!`);
    }
  } else {
    // Regular attack
    const damage = calculateDamage(attacker, defender);
    console.log(`${attacker.name} attacks ${defender.name} and deals ${damage} damage.`);
    defender.health -= damage;

    // Check if the regular attack knocked out the defender
    if (defender.health <= 0) {
      console.log(`${defender.name} has been knocked out!`);
    }
  }

  // Log the defender's remaining health
  console.log(`${defender.name}'s remaining health: ${defender.health}`);
}

// Example usage: Battle between two characters
const playerTeam = [archer, cleric, medic];
const enemyTeam = [mage, rogue, warrior];

// Simulate a battle between two teams
for (let i = 0; i < playerTeam.length; i++) {
  fight(playerTeam[i], enemyTeam[i]);
}
