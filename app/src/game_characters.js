// Game record
let totalCharacters = 0;
let allCharacters = [];
let players = [];


// Archer..
const archer = new Character("Archer", 80, 8, 15, 10, "Precision Hell Shot");

// Knight..
const cleric = new Character("Knight", 95, 10, 13, 7, "Heavy Strike");

// Medic..
const medic = new Character("Medic", 60, 5, 10, 8, "Healing Aura");

// mage..
const mage = new Character("Mage", 90, 10, 16, 9, "Fireball arcane blast");

// rogue
const rogue = new Character("Rogue", 75, 7, 13, 9, "Stealth Attack");

// warrior..
const warrior = new Character("warrior", 90, 12, 16, 6, "Cannon attack");

// paladin..
const paladin = new Character("paladin", 100, 11, 15, 7, "Divine freeze");

// Berserker..
const berserker = new Character("Berserker", 100, 12, 15, 6, "Berserk Rage");



class Character {
    constructor(name, health, strength, attack, speed, superPower) {
      this.name = name;
      this.health = health;
      this.strength = strength;
      this.attack = attack;
      this.speed = speed;
      this.superPower = superPower;
      this.id = 0;
    }
  
    displayInfo() {
      console.log(`
        Name: ${this.name}
        Health: ${this.health}
        Strength: ${this.strength}
        Attack: ${this.attack}
        Speed: ${this.speed}
        Super Power: ${this.superPower}
      `);
    }

    setId(id) {
        this.id = id;
    }
}


// Function to create a team
function createTeam(character1, character2, character3) {
    let myCharactersId = totalCharacters;
    totalCharacters = totalCharacters + 3;

    character1.setId(myCharactersId + 1);
    character2.setId(myCharactersId + 2);
    character3.setId(myCharactersId + 3);

    allCharacters.push(character1);
    allCharacters.push(character2);
    allCharacters.push(character3);

    character1.displayInfo();
    character2.displayInfo();
    character3.displayInfo();
    console.log("Team Created:");
}
  
  // Example: Create a team with Archer, Knight, and Medic
  createTeam(archer, knight, medic);
  