import * as gameCharacters from "./game_characters.js";
import * as strategySimulation from "./strategy_simulation.js";
// const gameCharacters = require("./game_characters.js");
// const strategySimulation = require("./strategy_simulation.js")

// {
//     duelId;
//     isActive;
//     duelCreator;
//     duelParticipant;
//     creatorWarriors[];
//     participantWarriors[];
//     creatorStrategy;
//     participantStrategy;
//     duelWinner;
//     duelLooser;
// }
let allDuels = [];
let availableDuels = [];
let totalDuels = 0;
let WhoPlaysFirst = 1;

class TurnsTracker {
    constructor() {
        this.turns = 0;
        this.max = 0;
    }

    increaseTurns() {
        if (this.turns == this.max || this.turns > this.max || this.max < 1) {
            this.turns = 0;
        } else {
            this.turns++;
        }
    }

    checkTurn() {
        return this.turns;
    }

    sync() {
        if (this.turns > this.max) {
            this.turns = this.max;
        }
    }

    clone() {
        const clonedTracker = new TurnsTracker();
        clonedTracker.turns = this.turns;
        clonedTracker.max = this.max;
        return clonedTracker;
    }
}

class Duel {
    constructor(duelCreator, creatorWarriors) {
        this.duelId = 0;
        this.isActive = false;
        this.isCompleted = false;
        this.duelCreator = duelCreator;
        this.duelParticipant = "";
        this.creatorWarriors = creatorWarriors;
        this.participantWarriors = [];
        this.creatorStrategy = "";
        this.participantStrategy = "";
        this.battleLog = [];
        this.duelWinner = "";
        this.duelLooser = "";
    }

    setId(id) {
        this.duelId = id;
    }

    joinDuel(participantAddress, participantWarriors) {
        this.isActive = true;
        this.duelParticipant = participantAddress;
        this.participantWarriors = participantWarriors;
    }

    displayDuelInfo() {
        console.log(`
            Duel Id: ${this.duelId}
            Duel Creator: ${this.duelCreator}
            Duel Participant: ${this.duelParticipant}
            Creator Warriors: ${this.creatorWarriors}
            Participant Warriors: ${this.participantWarriors}
            Creator Strategy: ${this.creatorStrategy}
            Participant Strategy: ${this.participantStrategy}
            battleLog: ${this.battleLog}
            Duel Winner: ${this.duelWinner}
            Duel Looser: ${this.duelLooser}
        `);
        return this
    }
}


// Function to create a new duel, it collects a cretors address then
// an array of players Id to for the duel.
function createDuel(creatorAddress, creatorWarriors) {
    if (creatorWarriors.length < 3) {
        throw new Error("Player must have at least 3 characters for battle");
    }

    let creatorsWarriors = gameCharacters.selectFightters(creatorAddress, creatorWarriors[0], creatorWarriors[1], creatorWarriors[2]);
    let newDuel = new Duel(creatorAddress, creatorsWarriors);

    totalDuels += 1;
    newDuel.duelId = totalDuels;
    allDuels.push(newDuel);

    console.log("New Duel created....");
    return newDuel;
}

// Function to create a new duel, it collects a duel Id, the participant address and an array of participant warriors
function joinDuel(duelID, participantAddress, participantWarriors) {
    let selectedDuel = allDuels.find(duel => duel.duelId === duelID);
    if (!selectedDuel) {
        throw new Error(`Invalid duel Id: "${duelID}" received`);
    }
    if (selectedDuel.isActive) {
        throw new Error("Duel already active");
    }
    if (selectedDuel.isCompleted) {
        throw new Error("Duel already completed");
    }
    if (participantWarriors.length < 3) {
        throw new Error("Player must have at least 3 characters for battle");
    }
    if (selectedDuel.duelCreator == participantAddress) {
        throw new Error("You cannot accept your own Duel!!");
    }

    let participantsWarriors = gameCharacters.selectFightters(participantAddress, participantWarriors[0], participantWarriors[1], participantWarriors[2]);

    selectedDuel.isActive = true;
    selectedDuel.joinDuel(participantAddress, participantsWarriors);

    console.log("Duel joined....");    
    console.log("Displaying both participants characters....");
    
    let bothWarriours = revealBothWarriors(duelID);

    return bothWarriours;
}

// Function to display a duel info, it collects a duel Id
function displayDuelInfo(duelID) {
    let selectedDuel = allDuels.find(duel => duel.duelId === duelID);
    if (!selectedDuel) {
        throw new Error(`Invalid duel Id: "${duelID}" received`);
    }
    return selectedDuel.displayDuelInfo();
}

function revealBothWarriors(duelId) {
    let selectedDuel = allDuels.find(duel => duel.duelId === duelId);
    if (!selectedDuel) {
        throw new Error(`Invalid duel Id: "${duelId}" received`);
    }
    console.log(`
        Creator Warriors: ${selectedDuel.creatorWarriors}
        Participant Warriors: ${selectedDuel.participantWarriors}
    `);
    return [JSON.stringify(selectedDuel.creatorWarriors), JSON.stringify(selectedDuel.participantWarriors)];
}

// function to set a players strategy if takes the duelID, the player address and a number representing the strategy index.
function setStrategy(duelID, playerAddress, strategy) {
    let selectedDuel = allDuels.find(duel => duel.duelId === duelID);
    if (!selectedDuel) {
        throw new Error(`Invalid duel Id: "${duelID}" received`);
    }
    if (!selectedDuel.isActive) {
        throw new Error("Duel not active");
    }
    if (selectedDuel.isCompleted) {
        throw new Error("Duel already completed");
    }
    let strategyType = strategySimulation.decodeStrategy(strategy);
    if (selectedDuel.duelCreator === playerAddress) {
        selectedDuel.creatorStrategy = strategy;
    } else if (selectedDuel.duelParticipant === playerAddress) {
        selectedDuel.participantStrategy = strategy;
    } else {
        throw new Error("Player not part of duel");
    }

    console.log(`Strategy set as ${strategyType}....`);
    return selectedDuel;
}


// function getDuelInfo(duelID) {
//     let selectedDuel = allDuels.find(duel => duel.duelId === duelID);
//     if (!selectedDuel) {
//         throw new Error(`Invalid duel Id: "${duelID}" received`);
//     }
//     return selectedDuel;
// }


function determineWhoPlaysFirst(number) {
    if (typeof number !== 'number') {
      throw new Error('Input must be a number');
    }
  
    // Use the remainder operator (%) to check if the number is odd or even
    return number % 2 === 0 ? 1 : 0;
  }

  // Function to get the index of an object in an array of objects.
  function findIndexInArray(jsonObject, arrayOfObjects) {
    for (let i = 0; i < arrayOfObjects.length; i++) {
        // Use JSON.stringify for deep equality comparison
        if (JSON.stringify(arrayOfObjects[i]) === JSON.stringify(jsonObject)) {
            return i;
        }
    }
    throw new Error("Index not found");
}


function fight(duelID) {
    let selectedDuel = allDuels.find((duel) => duel.duelId === duelID);
    if (!selectedDuel) {
        throw new Error(`Invalid duel Id: "${duelID}" received`);
    }
    if (!selectedDuel.isActive) {
        throw new Error("Duel not active");
    }
    if (selectedDuel.isCompleted) {
        throw new Error("Duel already completed");
    }
    if (selectedDuel.creatorStrategy === "" || selectedDuel.participantStrategy === "") {
        throw new Error("Strategy not set");
    }

    let creatorStrategy = selectedDuel.creatorStrategy;
    let participantStrategy = selectedDuel.participantStrategy;

    let creatorWarriors = gameCharacters.getWarriorsClone(selectedDuel.creatorWarriors);
    let participantWarriors = gameCharacters.getWarriorsClone(selectedDuel.participantWarriors);

    let AttackerTurnTracker = (new TurnsTracker).clone();
    let OpponentTurnTracker = (new TurnsTracker).clone();
    AttackerTurnTracker.max = 2;
    OpponentTurnTracker.max = 2;

    while (true) {
        // Check if any player has no more warriors
        if (creatorWarriors.length === 0) {
            selectedDuel.duelWinner = selectedDuel.duelParticipant;
            selectedDuel.duelLooser = selectedDuel.duelCreator;
            selectedDuel.isCompleted = true;
            console.log("Opponent wins.....");
            break;
        } else if (participantWarriors.length === 0) {
            selectedDuel.duelWinner = selectedDuel.duelCreator;
            selectedDuel.duelLooser = selectedDuel.duelParticipant;
            selectedDuel.isCompleted = true;
            console.log("Creator wins.....");
            break;
        } else {
            // Creator Attacks First
            let attacker = creatorWarriors[AttackerTurnTracker.checkTurn()];
            let opponent = strategySimulation.decideVictim(creatorStrategy, participantWarriors);

            let [attacker_, opponent_] = duel(attacker, opponent);
            creatorWarriors[AttackerTurnTracker.checkTurn()] = attacker_;

            // Populate the log of the entire battle.
            let duelLog = [attacker_, opponent_];
            selectedDuel.battleLog.push(duelLog);

            // Check if the opponent is dead
            if (opponent_.health < 1){
                let opponentIndex = findIndexInArray(opponent, participantWarriors);
                let deadWarrior = participantWarriors.splice(opponentIndex, 1);
                OpponentTurnTracker.max -= 1;
            } else {
                let opponentIndex = findIndexInArray(opponent, participantWarriors);
                console.log('index we modified is:', opponentIndex);

                participantWarriors[opponentIndex] = opponent_;
            }

            // CHECK IF THE FIRST PART OF THE DUEL ENDED THE BATTLE;
            if (creatorWarriors.length === 0) {
                selectedDuel.duelWinner = selectedDuel.duelParticipant;
                selectedDuel.duelLooser = selectedDuel.duelCreator;
                selectedDuel.isCompleted = true;
                console.log("Opponent wins.....");
                break;
            } else if (participantWarriors.length === 0) {
                selectedDuel.duelWinner = selectedDuel.duelCreator;
                selectedDuel.duelLooser = selectedDuel.duelParticipant;
                selectedDuel.isCompleted = true;
                console.log("Creator wins.....");
                break;
            } 

            // Participant Attacks Second
            OpponentTurnTracker.sync();
            attacker = participantWarriors[OpponentTurnTracker.checkTurn()];
            opponent = strategySimulation.decideVictim(participantStrategy, creatorWarriors);
            [attacker_ , opponent_] = duel(attacker, opponent);
            participantWarriors[OpponentTurnTracker.checkTurn()] = attacker_;

            // Populate the log of the entire battle.
            duelLog = [attacker_, opponent_];
            selectedDuel.battleLog.push(duelLog);

            // Check if the opponent is dead
            if (opponent_.health < 1){
                let opponentIndex = findIndexInArray(opponent, creatorWarriors);
                let deadWarrior = creatorWarriors.splice(opponentIndex, 1);
                AttackerTurnTracker.max -= 1;
                console.log(`Creator Warrior: ${JSON.stringify(deadWarrior)} is dead`);
            } else {
                let opponentIndex = findIndexInArray(opponent, creatorWarriors)
                creatorWarriors[opponentIndex] = opponent_;
            }
            AttackerTurnTracker.increaseTurns();
            OpponentTurnTracker.increaseTurns();
            console.log(`Another battle round over, participant statistics is creator: ${JSON.stringify(creatorWarriors)}, Participants ${JSON.stringify(participantWarriors)}`, );
        }
    }
    console.log(`Battle is over creators remaining warriors are: ${JSON.stringify(creatorWarriors)}, while opponent's remaining warriors are: ${JSON.stringify(participantWarriors)} `)
    return selectedDuel;
}

// Function to carrry out a duel, it takes 2 warriors object, simulates a duel then returns their updated self. 
function duel(attacker, opponent) {
    const damage = attacker.strength + (attacker.attack / 2);
    opponent.health = (opponent.health - damage) < 0 ? 0 : opponent.health - damage;
    attacker.attack = (attacker.attack - (damage / 5)) > 5 ? attacker.attack - damage / 5 : attacker.attack;
    attacker.strength = (attacker.strength - (damage / 7)) > 5 ? attacker.strength - damage / 7 : attacker.strength;
    console.log(`Attacker: ${attacker.name} with id:${attacker.id} dealt a damage of: ${damage} on ${opponent.name} with id: ${opponent.id}`)
    console.log(`Attackers strength is: ${attacker.strength}, while his attack is: ${attacker.attack}, then opponent's health is: ${opponent.health}`);
    return [attacker, opponent];
}

export {allDuels, totalDuels, availableDuels, Duel, createDuel, joinDuel, displayDuelInfo, revealBothWarriors, fight, setStrategy };