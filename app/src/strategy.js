import { allPlayers, playerMap } from './players_profile.js';
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

function freestyle_attack(char1, char2, char3, playerId) {
    let chosenAttacker = findCharacterByCriterion('speed', comparator);
    let player = playerMap[playerId];
    // Additional logic for freestyle_attack
}
