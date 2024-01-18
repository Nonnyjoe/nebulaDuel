totalPlayers = 0;
allPlayers = [];

class Player {
    constructor(Monika, walletAddress, avararURI) {
        this.Monika = Monika;
        this.walletAddress = walletAddress;
        this.avararURI = avararURI;
        this.characters = [];
        this.id = 0;
        this.point = 1000;   
     }

    displayInfo() {
        console.log(`
            Monika: ${this.Monika}
            walletAddress: ${this.walletAddress}
            avararURI: ${this.avararURI}
            characters: ${this.characters}
            id: ${this.id}
        `);
    }

    setId(id){
        this.id = id;
    }
}
  
// Function to create a player
function createPlayer(Monika, walletAddress, avararURI) {
    totalPlayers = totalPlayers + 1;

    const newPlayer = new Player(Monika, walletAddress, avararURI);

    newPlayer.setId(totalPlayers);

    allPlayers.push(newPlayer);

    newPlayer.displayInfo();

    console.log("New Player Created:");
}

// Example: Create a new Player
createPlayer("Player Bot", "0xPlayerBot", "X7ysdsa8");