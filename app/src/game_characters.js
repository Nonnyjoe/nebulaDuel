//import { allPlayers, findPlayer } from "./players_profile.js";
const { allPlayers, findPlayer } = require("./players_profile.js");

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

    getId(){
        return this.id;
    }

    setOwnerAddress(ownerAddress) {
        this.owner = ownerAddress;
    }

    clone() {
        // console.log('lets see what we\'re cloning ', this);
        // Create a new instance with the same properties
        return new Character(
            this.name,
            this.health,
            this.strength,
            this.attack,
            this.speed,
            this.superPower,
            this.price,
            this.id,
            this.owner
        );
    }

    battleClone() {
        // Create a clone of the character for the new battle
        console.log('lets see what we\'re cloning ', this.id);
        let newPlayer = this;
        console.log(`lets see newPlayer ${JSON.stringify(newPlayer)}`);
        return newPlayer;
    }
}

// Pikachu..
const Pikachu = new Character("Pikachu", 80, 8, 15, 10, "Thunderbolt", 270);
// Knight..
const Charizard = new Character("Charizard", 95, 10, 13, 7, "Flamethrower", 390);
// Bulbasaur..
const Bulbasaur = new Character("Bulbasaur", 60, 5, 10, 8, "Vine Whip", 250);
// Squirtle..
const Squirtle = new Character("Squirtle", 90, 10, 16, 9, "Water Gun", 380);
// Jigglypuff
const Jigglypuff = new Character("Jigglypuff", 75, 7, 13, 9, "Sleep Song", 300);
// Mewtwo..
const Mewtwo = new Character("Mewtwo", 90, 12, 16, 6, "Psychic", 380);
// Eevee..
const Eevee = new Character("Eevee", 100, 11, 15, 7, "Adaptability", 410);
// Gengar..
const Gengar = new Character("Gengar", 100, 12, 15, 6, "Shadow Ball", 420);


// Function to create a team
function createTeam(playerAddress, character1, character2, character3) {
    let totalPrice = character1.price + character2.price + character3.price;
    console.log("allPlayers....:", allPlayers,  "playerAddress....:", playerAddress)

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

    let myCharactersId = totalCharacters;
    
    // Create new instances for each player
    character1 = character1.clone();
    character2 = character2.clone();
    character3 = character3.clone();

    // set all characters ID
    character1.id = myCharactersId + 1;
    character2.id = myCharactersId + 2;
    character3.id = myCharactersId + 3;

    // update total characters Id
    totalCharacters = totalCharacters + 3;
    
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
  console.log("playerAddress: ", playerAddress, "characterID1: ", characterID1, "characterID2: ", characterID2, "characterID3: ", characterID3)
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
    let selectedCharacter = allCharacters.find(character => character.getId() == characterId);
    console.log("selected character is: " + selectedCharacter);
    console.log("character Id is: " + characterId)
    console.log("all characters are: " + JSON.stringify(allCharacters));

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
   
// Example: Create a team with Pikachu, Knight, and Bulbasaur
//   createTeam(Pikachu, knight, Bulbasaur);
  

// function to help handle a users selection during character createion
// such that the user passes in an ID the n using this function we get the character a user wishes to crate.
function resolveCharacters( id ) {
    switch (id) {
        case 1 : return Pikachu;
        case 2 : return Charizard;
        case 3 : return Bulbasaur;
        case 4 : return Squirtle;
        case 5 : return Jigglypuff;
        case 6 : return Mewtwo;
        case 7 : return Eevee;
        case 8 : return Gengar;
        default: throw new Error(`Invalid character Id: "${id}" received`);
    }
}

//Function to return a clone of the complete warriors data before each battle, it collects an array of players Id.
function getWarriorsClone(warrioursId) {
    if (warrioursId.length < 3) {
        throw new Error("Invalid number of characters");
    }
    let warriorsData = [];
    for (let i = 0; i < warrioursId.length; i++) {
        let warrior = getCharacterDetails(warrioursId[i]);
        console.log('warriorID..........', warrior.id)
        let warriorsBattleClone = warrior.battleClone();
        warriorsData.push(warriorsBattleClone);
        console.log('warriorsID After..........', (warriorsBattleClone));
    }
    return warriorsData;
}

module.exports = {allCharacters, totalCharacters, Character, createTeam, resolveCharacters, selectFightters, getCharacters, getCharacterDetails, getWarriorsClone};