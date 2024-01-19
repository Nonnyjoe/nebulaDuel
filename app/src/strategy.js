import { playerMap } from './players_profile.js';
import { allCharacters } from './game_characters.js';

// Define a generic comparator for checking if a is greater than b
function comparator(a, b) {
    return a > b;
}

// Define the opposite comparator for checking if a is less than b
function oppositeComparator(a, b) {
    return a < b;
}

function findCharacterByCriterion(criterion, comparator) {
    let characters = allCharacters;
    let selectedCharacter = allCharacters[0];

    if (characters.length === 0) {
        console.error("Error: No characters available.");
        return null;
    }

    for (let i = 1; i < characters.length; i++) {
        if (comparator(characters[i][criterion], selectedCharacter[criterion])) {
            selectedCharacter = characters[i];
        }
    }

    return selectedCharacter;
}

function attackByCriterion(criterion, comparator) {
    let selectedCharacter = findCharacterByCriterion(criterion, comparator);
    attack(selectedCharacter);
}

// Now, use the comparators in specific attack functions
function attack_strongest_character() {
    attackByCriterion('strength', comparator);
}

function attack_weakest_character() {
    attackByCriterion('strength', oppositeComparator);
}

function attack_healthiest_character() {
    attackByCriterion('health', comparator);
}

function attack_unhealthiest_character() {
    attackByCriterion('health', oppositeComparator);
}

function attack_fastest_character() {
    attackByCriterion('speed', comparator);
}

function attack_slowest_character() {
    attackByCriterion('speed', oppositeComparator);
}


function manual_strategy(char1, char2, char3, playerId) {
    let player = playerMap[playerId];
    let otherCharacters = allCharacters;

    // Check if the player has at least one character
    if (player.characters.length === 0) {
        console.error("Error: Player has no characters available for manual strategy.");
        return [];
    }

    // Compare player's characters based on strength, health, and speed
    let strongestCharacter = findPlayerCharacterByCriterion('strength', comparator, char1, char2, char3);
    let healthiestCharacter = findPlayerCharacterByCriterion('health', comparator, char1, char2, char3);
    let fastestCharacter = findPlayerCharacterByCriterion('speed', comparator, char1, char2, char3);

    // Return the characters with the highest attributes
    return [strongestCharacter, healthiestCharacter, fastestCharacter];
}

// Define a function to find a character with the highest attribute based on a criterion
function findPlayerCharacterByCriterion(criterion, comparator, char1, char2, char3) {
    let selectedCharacter = char1;

    if (comparator(char2[criterion], selectedCharacter[criterion])) {
        selectedCharacter = char2;
    }

    if (comparator(char3[criterion], selectedCharacter[criterion])) {
        selectedCharacter = char3;
    }

    return selectedCharacter;
}

 //samex

//  if ( char2.strength > selectedCharacter.strength) {
//     selectedCharacter = char2;
//  } else if (char3.strength > selectedCharacter.strength) {
//     selectedCharacter = char3;
//  } else {
//     selectedCharacter = char1;
//  }

//  return selectedCharacter;