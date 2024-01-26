// const { allPlayers, findPlayer } = require("./players_profile.js");
import { allPlayers, findPlayer } from "./players_profile.js";
// const gameCharacters = require("./game_characters");
import * as gameCharacters from "./game_characters.js";
// import * as battleChallenge from "./battleChallenge.js";

// const battleChallenge = require("./battleChallenge");
// import ethers from "ethers";

let listedCharacters = [];

// function _erc20_deposit_parse (_payload) {
//     try {
//       let input_data = [];
//       input_data[0] = ethers.dataSlice(_payload, 0, 1);
//       input_data[1] = ethers.dataSlice(_payload, 1, 21);
//       input_data[2] = ethers.dataSlice(_payload, 21, 41);
//       input_data[3] = ethers.dataSlice(_payload, 41, 73);

//       if (!input_data[0]) {
//         throw new EvalError("erc20 deposit unsuccessful");
//         return ["0x0", "0x0", BigInt(0)];
//       }
//       return [
//         getAddress(input_data[1]),
//         getAddress(input_data[2]),
//         BigInt(input_data[3]),
//         // parseEther(String(parseInt(input_data[3])), "gwei"),
//       ];
//     } catch (e) {
//       throw new EvalError(String(e));
//       return ["0x0", "0x0", BigInt(0)];
//     }
//   };

  function erc20_deposit_process (_payload) {
    //process the abi-encoded input data sent by the erc20 portal after and erc20 deposit
    try {
      let [erc20, account, amount] = _erc20_deposit_parse(_payload);
      console.log(`${amount} ${erc20} tokens deposited to account ${account}`);
      return deposit(account, amount);
    } catch (e) {
      throw new Error(`error depositing erc20 tokens ${e}`);
    }
  };


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
  // characterId is the actual Id of the character
  function findIndexInArray(characterId, listedCharacters) {
    for (let i = 0; i < listedCharacters.length; i++) {
        // Use JSON.stringify for deep equality comparison
        if (parseInt(listedCharacters[i].characterId) === parseInt(characterId)) {
            return i;
        }
    }
    throw new Error("Index not found");
}

// findindex of anon json Object
function findIndex2(characterId, listedCharacters) {
  for (let i = 0; i < listedCharacters.length; i++) {
      // Use JSON.stringify for deep equality comparison
      if (parseInt(listedCharacters[i]) === parseInt(characterId)) {
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

function listCharacter(userAddress, _characterId, price) {
    let characterId = gameCharacters.confirmOwnership(userAddress, _characterId);
    assertNotListed(characterId);
    let saleDetails = {characterId: characterId, price: price, seller: userAddress};
    listedCharacters.push(saleDetails);
    return listedCharacters;
}

function modifyListPrice(userAddress, characterId, listPrice) {
    let characterIndex = findIndexInArray(characterId, listedCharacters);
    let characterId2 = gameCharacters.confirmOwnership(userAddress, characterId);
    listedCharacters[characterIndex].price = listPrice;
    return listedCharacters[characterIndex];
}


function BuyCharacter(characterId, buyerAddress) {
  console.log("debug:", listedCharacters);
    let characterIndex = findIndexInArray(characterId, listedCharacters);
    let characterPrice = listedCharacters[characterIndex].price;
    if(!findPlayer(allPlayers, buyerAddress)) {
        throw new Error("Buyer Not a registered player");
    }
    let buyer = findPlayer(allPlayers, buyerAddress);
    let buyerNebulaBalance = buyer.NebulaTokenBalance;
    if (buyerNebulaBalance < characterPrice) {
        throw new Error("Insufficient balance")
    }
    gameCharacters.getCharacterDetails(characterId).owner = buyerAddress;
    let seller = findPlayer(allPlayers, listedCharacters[characterIndex].seller);
    
    buyer.characters.push(characterId);
    console.log("here to debug");
    console.log("characters:", seller.characters);
    console.log("debuging..",characterId);
    let characterIndexInSeller = findIndex2(characterId, seller.characters);
    seller.characters.splice(characterIndexInSeller, 1);
    listedCharacters.splice(characterIndex, 1);
    return [seller, buyer];
}


export {BuyCharacter, modifyListPrice, listCharacter, transferToken, withdraw, erc20_deposit_process, deposit, listedCharacters};