import * as gameCharacters from "./game_characters";
import * as strategySimulation from "./strategy_simulation";

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
    }

    increaseTurns() {
        if (this.turns == 2) {
            this.turns = 0;
        } else {
            this.turns++;
        }
    }

    checkTurn(){
        return this.turns;
    }

    clone() {
        return new TurnsTracker(
            this.turns,
        );
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


function getDuelInfo(duelID) {
    let selectedDuel = allDuels.find(duel => duel.duelId === duelID);
    if (!selectedDuel) {
        throw new Error(`Invalid duel Id: "${duelID}" received`);
    }
    return selectedDuel;
}


function determineWhoPlaysFirst(number) {
    if (typeof number !== 'number') {
      throw new Error('Input must be a number');
    }
  
    // Use the remainder operator (%) to check if the number is odd or even
    return number % 2 === 0 ? 1 : 0;
  }


function fight(duelID){
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
    if (selectedDuel.creatorStrategy === "" || selectedDuel.participantStrategy === "") {
        throw new Error("Strategy not set");
    }

    let creatorStrategy = selectedDuel.creatorStrategy;
    let participantStrategy = selectedDuel.participantStrategy;

    let creatorWarriors = gameCharacters.getWarriorsClone(selectedDuel.creatorWarriors);
    let participantWarriors = gameCharacters.getWarriorsClone(selectedDuel.participantWarriors);

    let creatorScore = 0;
    let participantScore = 0;

    let turnTracker = (new TurnsTracker).clone();
    let firstPlayer = determineWhoPlaysFirst(WhoPlaysFirst) == 0 ? creatorWarriors : participantWarriors;
    let secondPlayer = determineWhoPlaysFirst(WhoPlaysFirst) == 0? participantWarriors : creatorWarriors;

    while (true) {
        if (firstPlayer.length == 0) {
            break;
        } else if (secondPlayer.length == 0) {
            break;
        } else {
            let attacker = firstPlayer[turnTracker.checkTurn()];
            let opponent = secondPlayer == participantWarriors ? 
                strategySimulation.decideVictim(creatorStrategy, participantWarriors) :
                strategySimulation.decideVictim(participantStrategy, creatorWarriors)
            ;

            duel(attacker, opponent);

            attacker = secondPlayer == 
            turnTracker.increaseTurns();
        }
    }
    

    for (let i = 0; i < 3; i++) {
        let creatorWarrior = gameCharacters.findCharacter(creatorWarriors[i]);
        let participantWarrior = gameCharacters.findCharacter(participantWarriors[i]);
        let creatorWarriorPower = creatorWarrior.power;
        let participantWarriorPower = participantWarrior.power;

        if (creatorStrategy[i] === "A" && participantStrategy[i] === "D") {
            creatorScore += creatorWarriorPower;
        } else if (creatorStrategy[i] === "D" && participantStrategy[i] === "A") {
            participantScore += participantWarriorPower;
        } else if (creatorStrategy[i] === "A" && participantStrategy[i] === "A") {
            if (creatorWarriorPower > participantWarriorPower) {
                creatorScore += creatorWarriorPower;
            } else if (creatorWarriorPower < participantWarriorPower) {
                participantScore += participantWarriorPower;
            }
        } else if (creatorStrategy[i] === "D" && participantStrategy[i] === "D") {
            if (creatorWarriorPower > participantWarriorPower) {
                participantScore += participantWarriorPower;
            } else if (creatorWarriorPower < participantWarriorPower) {
                creatorScore += creatorWarriorPower;
            }
        }
    }

    if (creatorScore > participantScore) {
        selectedDuel.duelWinner = selectedDuel.duelCreator;
        selectedDuel.duelLooser = selectedDuel.duelParticipant;

        console.log("Duel Winner: " + selectedDuel.duelWinner);
        console.log("Duel Looser: " + selectedDuel.duelLooser);

        selectedDuel.isCompleted = true;

        return selectedDuel.duelWinner;
    }

}

export {allDuels, totalDuels, availableDuels, Duel, createDuel, joinDuel, displayDuelInfo, revealBothWarriors, };