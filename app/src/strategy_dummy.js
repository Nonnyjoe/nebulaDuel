allStrategies = [];
//TODO: attack function
import { allCharacters } from './game_characters.js';
import { playerMap, allPlayers } from './players_profile.js';

function attack_strongest_character() {
    let characters = allCharacters;
    let strongestCharacter = allCharacters[0];

    for (let i = 1; i < characters.length; i++) {
        if (characters[i].strength > strongestCharacter.strength) {
            strongestCharacter = characters[i];
        }
    }

    attack(strongestCharacter);
}


function attack_weakest_character() {
    let characters = allCharacters;
    let weakestCharacter = allCharacters[0];

    for (let i = 1; i < characters.length; i++) {
        if(characters[i].strength < weakestCharacter.strength) {
            weakestCharacter = characters[i];
        }
    }

    attack(weakestCharacter);
}

function attack_healthiest_character() {
    let characters = allCharacters;
    let healthiestCharacter = allCharacters[0];

    for (let i = 1; i < characters.length; i++) {
        if(characters[i].health > healthiestCharacter.health) {
            healthiestCharacter = characters[i];
        }
    }

    attack(healthiestCharacter);
}

function attack_unhealthiest_character() {
    let characters = allCharacters;
    let unhealthiestCharacter = allCharacters[0];

    for (let i = 1; i < characters.length; i++) {
        if(characters[i].health < unhealthiestCharacter.health) {
            unhealthiestCharacter = characters[i];
        }
    }

    attack(unhealthiestCharacter);
}

function attack_fastest_character() {
    let characters = allCharacters;
    let fastestCharacter = allCharacters[0];

    for (let i = 1; i < characters.length; i++) {
        if(characters[i].speed > fastestCharacter.speed) {
            fastestCharacter = characters[i];
        }
    }

    attack(fastestCharacter);
}

function attack_slowest_character() {
    let characters = allCharacters;
    let slowestCharacter = allCharacters[0];

    for (let i = 1; i < characters.length; i++) {
        if(characters[i].speed < slowestCharacter.speed) {
            slowestCharacter = characters[i];
        }
    }

    attack(slowestCharacter);
}

// function strengthComparator()
///TODO - not completed

function manual_strategy(char1, char2, char3, playerId) {
    let characters = allCharacters;
    let chosenAttacker = allCharacters[0];
    
    let player = playerMap[playerId];


    
}

