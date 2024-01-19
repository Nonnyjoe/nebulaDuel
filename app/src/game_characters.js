const { allPlayers, findPlayer } = require("./players_profile");

// Game record
let totalCharacters = 0;
let allCharacters = [];

class Character {
    constructor(name, health, strength, attack, speed, superPower, price) {
      this.name = name;
      this.health = health;
      this.strength = strength;
      this.attack = attack;
      this.speed = speed;
      this.superPower = superPower;
      this.id = 0;
      this.totalWins = 0;
      this.totalLoss = 0;
      this.price = price;
      this.owner = "";
    }
  
    displayInfo() {
      console.log(`
        Name: ${this.name}
        Health: ${this.health}
        Strength: ${this.strength}
        Attack: ${this.attack}
        Speed: ${this.speed}
        Super Power: ${this.superPower}
        id: ${this.id}
        totalWins: ${this.totalWins}
        totalLoss: ${this.totalLoss}
        price: ${this.price}
        owner: ${this.owner}
      `);
    }

    setId(id) {
        this.id = id;
    }

    setOwnerAddress(ownerAddress) {
        this.owner = ownerAddress;
    }
}

// Archer..
const archer = new Character("Archer", 80, 8, 15, 10, "Precision Hell Shot", 270);
// Knight..
const cleric = new Character("Knight", 95, 10, 13, 7, "Heavy Strike", 390);
// Medic..
const medic = new Character("Medic", 60, 5, 10, 8, "Healing Aura", 250);
// mage..
const mage = new Character("Mage", 90, 10, 16, 9, "Fireball arcane blast", 380);
// rogue
const rogue = new Character("Rogue", 75, 7, 13, 9, "Stealth Attack", 300);
// warrior..
const warrior = new Character("warrior", 90, 12, 16, 6, "Cannon attack", 380);
// paladin..
const paladin = new Character("paladin", 100, 11, 15, 7, "Divine freeze", 410);
// Berserker..
const berserker = new Character("Berserker", 100, 12, 15, 6, "Berserk Rage", 420);


// Function to create a team
function createTeam(playerAddress, character1, character2, character3) {
    let totalPrice = character1.price + character2.price + character3.price;

    // search array of players for specific player.
    let foundPlayer = findPlayer(allPlayers, playerAddress);

    //Throw an error if player dows not exist.
    if (!foundPlayer) {
        throw new Error(`Player with wallet address ${playerAddress} not found.`);
    }

    // NOTE: filter through all players then get the active player;
    if (foundPlayer.point < totalPrice) {
        throw new Error("Insufficient points to make the purchase");
    }

    // subtract the total price from his total balance.
    foundPlayer.point -= totalPrice;

    // update total characters Id
    let myCharactersId = totalCharacters;
    totalCharacters = totalCharacters + 3;

    // set all characters ID
    character1.setId(myCharactersId + 1);
    character2.setId(myCharactersId + 2);
    character3.setId(myCharactersId + 3);

    // set the owner of the character
    character1.setOwnerAddress(playerAddress);
    character2.setOwnerAddress(playerAddress);
    character3.setOwnerAddress(playerAddress);

    // populate all characters array
    allCharacters.push(character1);
    allCharacters.push(character2);
    allCharacters.push(character3);

    // update a players character list
    foundPlayer.characters.push(character1.id);
    foundPlayer.characters.push(character2.id);
    foundPlayer.characters.push(character3.id);

    console.log("Purchase successful!!!");
    return [JSON.stringify(character1), JSON.stringify(character2), JSON.stringify(character3)];
}

// function to return an array containing the Id's of a users characters
function getCharacters( playerAddress) {
    let player = findPlayer(allPlayers, playerAddress);
    return player.characters;
}

// function that collects a users address and the id of the 3 characters he selected
// we run a check to confirm that the character exists and also belongs to the said address
// then we return an array of the selected characters id
function selectFightters( playerAddress, characterID1, characterID2, characterID3) {
    let selectedChampions = [];
    selectedChampions.push(confirmOwnership(playerAddress, characterID1));
    selectedChampions.push(confirmOwnership(playerAddress, characterID2));
    selectedChampions.push(confirmOwnership(playerAddress, characterID3));

    console.log("Champions selected");
    return selectedChampions;
}

// function that takes an address and a character id, then verifies that that 
// character exists and also belongs to the specified address, finally it returns the character ID.
function confirmOwnership(userAddress, characterId) {
    let selectedCharacter = allCharacters.find(character => character.id === characterId);
    if(!findPlayer(allPlayers, userAddress)) {
        throw new Error("Player does not exist");
    }
    if (!selectedCharacter) {
        throw new Error(`Invalid character Id: "${characterId}" received`);
    }
    if (selectedCharacter.owner!== userAddress) {
        throw new Error(`Player not owner of character Id: "${characterId}"`);
    }

    return characterId;
}


function getCharacterDetails( characterId ) {
    let selectedCharacter = allCharacters.find(character => character.id === characterId);
    if (!selectedCharacter) {
        throw new Error(`Invalid character Id: "${characterId}" received`);
    }
    return selectedCharacter;
}
   
// Example: Create a team with Archer, Knight, and Medic
//   createTeam(archer, knight, medic);
  

// function to help handle a users selection during character createion
// such that the user passes in an ID the n using this function we get the character a user wishes to crate.
function resolveCharacters( id ) {
    switch (id) {
        case 1 : return archer;
        case 2 : return cleric;
        case 3 : return medic;
        case 4 : return mage;
        case 5 : return rogue;
        case 6 : return warrior;
        case 7 : return paladin;
        case 8 : return berserker;
        default: throw new Error(`Invalid character Id: "${id}" received`);
    }
}

module.exports = {allCharacters, totalCharacters, Character, createTeam, resolveCharacters, selectFightters, getCharacters, getCharacterDetails};

  // ATTEMPT PURCHASE IN A TRY AND CATCH BLOCK
  //try {
    // Example usage
    //const player = { points: 50 };
    //const totalPrice = 100;
    //const result = purchaseItems(player, totalPrice);
    //console.log(result);
 // } catch (error) {
    // Handle the error here
   // console.error(error.message);
  //}