const { allPlayers, findPlayer } = require("./players_profile.js");
const gameCharacters = require("./game_characters");

let listedCharacters = [];

function deposit(userAddress, amount) {
   let player = findPlayer(allPlayers, userAddress);
   player.NebulaTokenBalance += amount;
   return player;
}

function withdraw(userAddress, amount) {
   let player = findPlayer(allPlayers, userAddress);
   let playerNebulaBalance = player.NebulaTokenBalance;
   if (playerNebulaBalance < amount) {
    throw new Error("Insufficient balance")
   }
   player.NebulaTokenBalance -= amount;
   return [player, amount];
}


function transferToken(userAddress, receiverAddress, amount) {
    if(!findPlayer(allPlayers, receiverAddress)) {
        throw new Error("Receiver Not a registered player");
    }
    let player = findPlayer(allPlayers, userAddress);
    let receiver = findPlayer(allPlayers, receiverAddress);
    let playerNebulaBalance = player.NebulaTokenBalance;
    if (playerNebulaBalance < amount) {
     throw new Error("Insufficient balance")
    }
    player.NebulaTokenBalance -= amount;
    receiver.NebulaTokenBalance += amount;
    return [player, receiver];
}

  // Function to get the index of an object in an array of objects.
  function findIndexInArray(characterId, listedCharacters) {
    for (let i = 0; i < listedCharacters.length; i++) {
        // Use JSON.stringify for deep equality comparison
        if (parseInt(listedCharacters[i].characterId) === parseInt(characterId)) {
            return i;
        }
    }
    throw new Error("Index not found");
}

function assertNotListed(characterId) {
    for (let i = 0; i < listedCharacters.length; i++) {
        // Use JSON.stringify for deep equality comparison
        if (parseInt(listedCharacters[i].characterId) === parseInt(characterId)) {
            throw new Error("Character already Listed");
        }
    }
}

function listCharacter(userAddress, characterId, price) {
    let characterId = gameCharacters.confirmOwnership(userAddress, characterId);
    assertNotListed(characterId);
    let saleDetails = {characterId: characterId, price: price, seller: userAddress};
    listedCharacters.push(saleDetails);
}

function modifyListPrice(userAddress, characterId, listPrice) {
    let characterIndex = findIndexInArray(characterId, listedCharacters);
    let characterId = gameCharacters.confirmOwnership(userAddress, characterId);
    listedCharacters[characterIndex].price = listPrice;
    return listedCharacters[characterIndex];
}

function BuyCharacter(characterId) {
    let characterIndex = findIndexInArray(characterId, listedCharacters);
    let characterPrice = listedCharacters[characterIndex].price;

    
}




