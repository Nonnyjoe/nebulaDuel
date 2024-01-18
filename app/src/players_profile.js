let totalPlayers = 0;
let allPlayers = [];

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

    newPlayer.setId(totalPlayers);

    allPlayers.push(newPlayer);

    newPlayer.displayInfo();

    console.log("New Player Created:");
    
    return newPlayer;
}

// Example: Create a new Player
// createPlayer("Player Bot", "0xPlayerBot", "X7ysdsa8");

export { allPlayers, createPlayer, Player, totalPlayers };