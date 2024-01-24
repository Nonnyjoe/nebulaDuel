let totalPlayers = 0;
let allPlayers = [];

// Function to find a specific player from players list
function findPlayer (allPlayers, playerAddress) {
    console.log("allPlayers: ", allPlayers, "playerAddress: ", playerAddress);
    const foundPlayer = allPlayers.find(player => player.walletAddress === playerAddress);
    return foundPlayer;
}

class Player {
    constructor(Monika, walletAddress, avatarURI) {
        this.Monika = Monika;
        this.walletAddress = walletAddress;
        this.avatarURI = avatarURI;
        this.characters = [];
        this.id = 0;
        this.point = 1000; 
        this.nebulaBalance = 0;  
     }

    displayInfo() {
        console.log(`
            Monika: ${this.Monika}
            walletAddress: ${this.walletAddress}
            avatarURI: ${this.avatarURI}
            characters: ${this.characters}
            id: ${this.id}
        `);
    }

    setId(id){
        this.id = id;
    }

    modifyMonika( newMonika) {
        this.Monika = newMonika;
    }

    modifyAvatar( newAvatar ) { 
        this.avatarURI = newAvatar;
    }
}
  
// Function to create a player
function createPlayer(Monika, walletAddress, avatarURI) {
    //check if player already exist
    if(findPlayer(allPlayers, walletAddress)) {
        throw new Error("Player already exist");
    }

    totalPlayers = totalPlayers + 1;

    const newPlayer = new Player(Monika, walletAddress, avatarURI);

    newPlayer.setId(totalPlayers);

    allPlayers.push(newPlayer);

    console.log("New Player Created:");
    
    return newPlayer;
}

// View profile
function getProfile(userAddress) {
    let playersProfile = findPlayer(allPlayers, userAddress);
    return playersProfile;
}



// Example: Create a new Player
// createPlayer("Player Bot", "0xPlayerBot", "X7ysdsa8");

module.exports = { allPlayers, createPlayer, Player, totalPlayers , findPlayer, getProfile}; 
