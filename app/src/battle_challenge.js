import * as gameCharacters from "./game_characters";

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
let totalDuels = 0;

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
    return newDuel.duelId;
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

    let participantsWarriors = gameCharacters.selectFightters(participantAddress, participantWarriors[0], participantWarriors[1], participantWarriors[2]);

    selectedDuel.joinDuel(participantAddress, participantsWarriors);

    console.log("Duel joined....");
    return selectedDuel.duelId;
}

// Function to display a duel info, it collects a duel Id
function displayDuelInfo(duelID) {
    let selectedDuel = allDuels.find(duel => duel.duelId === duelID);
    if (!selectedDuel) {
        throw new Error(`Invalid duel Id: "${duelID}" received`);
    }
    selectedDuel.displayDuelInfo();
}

export {allDuels, totalDuels, Duel, createDuel, joinDuel, displayDuelInfo};