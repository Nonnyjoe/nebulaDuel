totalPlayers = 0;
allPlayers = [];
let playerMap = {};

// Function to find a specific player from players list
function findPlayer (allPlayers, playerAddress) {
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
    totalPlayers = totalPlayers + 1;

    const newPlayer = new Player(Monika, walletAddress, avatarURI);
    
    for (const player of allPlayers) {
        playerMap[player.id] = player;
    }

    newPlayer.setId(totalPlayers);

    allPlayers.push(newPlayer);

    console.log("New Player Created:");
    
    return newPlayer;
}
export {playerMap};

// View profile
function getProfile(userAddress) {
    let playersProfile = findPlayer(allPlayers, userAddress);
    return playersProfile;
}



// Example: Create a new Player
// createPlayer("Player Bot", "0xPlayerBot", "X7ysdsa8");

export { allPlayers, createPlayer, Player, totalPlayers, findPlayer, playerMap };