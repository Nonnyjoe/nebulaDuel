//TODO: attack functions';
import * as allCharacters from "./game_characters.js";
//import {playerMap, allPlayers } from './players_profile.js';


// Define an "enum" for strategy using an object
const allStrategy = {
    MaxHealthToLowest: 'M2LH',
    LowestHealthToMax: 'L2MH',
    MaxStrengthToLowest: 'M2LS',
    LowestStrengthToMax: 'l2MS',
  };

  // function to decode the strategy a player selected, it collects a numerical argument
  // and returns the strategy thats mapped to that id.
  function decodeStrategy(strategyId) {
    console.log(`Decoding strategy: ${strategyId}`);
    switch (strategyId) {
        case 1:
            return allStrategy.MaxHealthToLowest;
        case 2:
            return allStrategy.LowestHealthToMax;
        case 3:
            return allStrategy.MaxStrengthToLowest;
        case 4:
            return allStrategy.LowestStrengthToMax;
        default:
            throw new Error("Invalid strategy Id: " + strategyId);
    }
  }

    // Function to determine who the victim of an attack is going to be, 
    // it collects the strategy and also an array of opponentsId as arguments.
  function decideVictim(strategy, opponents) {
    console.log("strategy", strategy)
    let victim;
    switch (decodeStrategy(strategy)) {
      case allStrategy.MaxHealthToLowest:
        victim = findMaxHealth(opponents);
        break;
      case allStrategy.LowestHealthToMax:
        victim = findMinHealth(opponents);
        break;
      case allStrategy.MaxStrengthToLowest:
        victim = findMaxStrength(opponents);
        break;
      case allStrategy.LowestStrengthToMax:
        victim = findMinStrength(opponents);
        break;
      default: throw new Error("Invalid strategy");
    }
    return victim;
  }

    // function to return the complete object of the players, it collects an array of characterId
    function getCharacterDetails(characters) {
        let selectedChar = []
        for (let i = 0; i < characters.length; i++) {
            let selectedCharacter = allCharacters.allCharacters.find(character => character.getId() == characters[i]);
            selectedChar.push(selectedCharacter);
        }
        if (selectedChar.length < 3) {
            throw new Error("Not enough characters selected");
        }
        return selectedChar;
    }

    // Functio to get the character with the highest health, it takes in an array of characters as argument
  function findMaxHealth(selectedChar) {
    // let selectedChar = getCharacterDetails(characters);
    let highestHealthCharacter = selectedChar[0];

    // console.log("selectedChar", selectedChar, "characters", selectedChar)

    for (let i = 0; i < selectedChar.length; i++) {
      if (selectedChar[i].health > highestHealthCharacter.health) {
        highestHealthCharacter = selectedChar[i];
      }
    }
    return highestHealthCharacter;
  }

    // Functio to get the character with the lowest health, it takes in an array of characters as argument
  function findMinHealth(selectedChar) {
    //let selectedChar = getCharacterDetails(characters);
    let lowestHealthCharacter = selectedChar[0];

    for (let i = 0; i < selectedChar.length; i++) {
      if (selectedChar[i].health < lowestHealthCharacter.health) {
        lowestHealthCharacter = selectedChar[i];
      }
    }
    return lowestHealthCharacter;
  }

    // Functio to get the character with the highest strength, it takes in an array of characters as argument
  function findMaxStrength(selectedChar) {
   // let selectedChar = getCharacterDetails(characters);
    let highestStrengthCharacter = selectedChar[0];

    for (let i = 0; i < selectedChar.length; i++) {
      if (selectedChar[i].strength > highestStrengthCharacter.strength) {
        highestStrengthCharacter = selectedChar[i];
      }
    }
    return highestStrengthCharacter;
  }

    // Functio to get the character with the lowest strength, it takes in an array of characters as argument
  function findMinStrength(selectedChar) {
    //let selectedChar = getCharacterDetails(characters);
    let lowestStrengthCharacter = selectedChar[0];

    for (let i = 0; i < selectedChar.length; i++) {
      if (selectedChar[i].strength < lowestStrengthCharacter.strength) {
        lowestStrengthCharacter = selectedChar[i];
      }
    }
    return lowestStrengthCharacter;
  }



// function strengthComparator()
///TODO - not completed

// function manual_strategy(char1, char2, char3, playerId) {
//     let characters = allCharacters;
//     let chosenAttacker = allCharacters[0];
    
//     let player = playerMap[playerId];  
// }

export { decideVictim, decodeStrategy }

