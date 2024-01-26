import * as playersProfile from "./players_profile.js";
import * as gameCharacters from "./game_characters.js";
import * as battleChallenge from "./battle_challenge.js";
import * as marketplace from "./marketplace.js";



//{"method":"create_profile","name":"0xreadyPlayer1","avatarURI":"X7sdsa8ycn"}
function createProfile(name, owner, avatarURI){
  console.log("creating profile....");
  const createdProfile = playersProfile.createPlayer( name,  owner, avatarURI);
  console.log("created profile is:", createdProfile);
}

//{"method":"get_profile", "user": "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266"}
function getProfile(owner){
  let userProfile = playersProfile.getProfile(owner);
  console.log("getting  profile....");
  console.log("player profile: " + JSON.stringify(userProfile)); 
}

//{"method":"create_team","char1": 1,"char2": 8, "char3": 5}
function createTeam(owner, char1, char2, char3){
  console.log("creating team...");
  let characters = gameCharacters.createTeam(
    owner,
    gameCharacters.resolveCharacters(parseInt(char1, 10)),
    gameCharacters.resolveCharacters(parseInt(char2, 10)),
    gameCharacters.resolveCharacters(parseInt(char3, 10))
  ); 

  console.log("Purchased Characters are:" + characters);
  let player = playersProfile.findPlayer(playersProfile.allPlayers, owner);
  console.log("players profile after purchase is:" + player);

}

//{"method": "create_duel", "selectedCharacters": [2, 1, 3]}
function createDuel(owner, characters){
  console.log("creating a duel.....");
  let newDuel = battleChallenge.createDuel(owner, characters);
  console.log("New duel created, duel data is:" + JSON.stringify(newDuel))
}

//{"method": "join_duel", "dielId": 1 , "selectedCharacters": [4, 5, 6]}
function joinDuel(duelId, owner, characters){
  console.log("Joining an existing duel....");
  let bothWarriors = battleChallenge.joinDuel(duelId, owner, characters);
  console.log("Join successfully, competing characters are: " + JSON.stringify(bothWarriors));

  // emit a notice of the duel data
  let duelData = battleChallenge.displayDuelInfo(duelId);
  console.log("Duel data is: " + JSON.stringify(duelData));
}

//duelID, playerAddress, strategy
function chooseStrategy(duelID, owner, strategy){
  console.log("Selcting Strategy.....")
  let userStrategy = battleChallenge.setStrategy(duelID, owner, strategy)
  console.log("Strategy Created Succesfully..." + JSON.stringify(userStrategy))

}

function getDuelInfo(duelID){
  console.log("Getting duel ...")
  let duelInfo = battleChallenge.displayDuelInfo(duelID)
  console.log("Duel info:...", duelInfo )
}

function fight(duelID){
  console.log("fighting...")
  let fightee =  battleChallenge.fight(duelID);
  console.log("fighting...", fightee)
}

function deposit(userAddress, amount) {
  console.log("depositing...")
  let userProfileB4Deposit = playersProfile.getProfile(userAddress);
  console.log("user initial profile:", JSON.stringify(userProfileB4Deposit));
  let player = marketplace.deposit(userAddress, amount);
  let userProfileAfterDeposit = playersProfile.getProfile(userAddress);
  console.log("user final profile:", JSON.stringify(userProfileAfterDeposit));
}


function withdraw(userAddress, amount) {
  console.log("withdrawing...")
  let userProfileB4Withdraw = playersProfile.getProfile(userAddress);
  let player = marketplace.withdraw(userAddress, amount);
  let userProfileAfterWithdraw = playersProfile.getProfile(userAddress);
  // if (userProfileAfterWithdraw != (userProfileB4Withdraw - amount)) {
  //   throw new Error("Withdraw test failed");
  // }
  console.log(JSON.stringify(userProfileAfterWithdraw));
}

function transferToken(userAddress, receiverAddress, amount) {
  console.log("transferring...")
  let userProfileB4Transfer = playersProfile.getProfile(userAddress);
  let receiverProfileB4Transfer = playersProfile.getProfile(receiverAddress);
  let transfer = marketplace.transferToken(userAddress, receiverAddress, amount);
  let userProfileAfterTransfer = playersProfile.getProfile(userAddress);
  let receiverProfileAfterTransfer = playersProfile.getProfile(receiverAddress);
  // if (userProfileAfterTransfer != (userProfileB4Transfer - amount) && receiverProfileAfterTransfer != receiverProfileB4Transfer + amount) {
  //   throw new Error("Transfer test failed");
  // }
  console.log(JSON.stringify(userProfileAfterTransfer));
}

function listCharacter(userAddress, characterId, price) {
  console.log("listing.....");
  let listReceipt = marketplace.listCharacter(userAddress, characterId, price);
  console.log(JSON.stringify(marketplace.listedCharacters));
  // if (marketplace.listedCharacters.length != 1 ){
  //   throw new Error("List test failed");
  // }
}

function modifyListPrice(userAddress, characterId, price) {
  console.log("modifying...");
  let listReceipt = marketplace.modifyListPrice(userAddress, characterId, price);
  console.log(JSON.stringify(marketplace.listedCharacters));
  if (marketplace.listedCharacters[0].price != price ){
    throw new Error("Modification test failed");
  }
}

function BuyCharacter(characterId, buyerAddress) {
  console.log("Buying.....");
  let buyReceipt = marketplace.BuyCharacter(characterId, buyerAddress);
  if (marketplace.listedCharacters.length != 0) {
    throw new Error("Buy test failed");
  }
  if (gameCharacters.getCharacterDetails(characterId).owner != buyerAddress) {
    throw new Error("Buy test failed2");
  }

  console.log(JSON.stringify(gameCharacters.getCharacterDetails(characterId)));
  console.log("sellers's Profile: " + JSON.stringify(playersProfile.getProfile("0x12896191de42EF8388f2892Ab76b9a728189260A")))

}















createProfile( "0xreadyPlayer1", "0x12896191de42EF8388f2892Ab76b9a728189260A", "X7sdsa8ycn");
createProfile( "0xreadyPlayer2", "0x311350f1c7Ba0F1749572Cc8A948Dd7f9aF1f42a", "X7sdsa8ycn");

createTeam("0x12896191de42EF8388f2892Ab76b9a728189260A", 5, 1, 8)
        
createTeam("0x311350f1c7Ba0F1749572Cc8A948Dd7f9aF1f42a", 1, 8, 5)

getProfile("0x12896191de42EF8388f2892Ab76b9a728189260A")

createDuel("0x12896191de42EF8388f2892Ab76b9a728189260A", [1, 2, 3])

joinDuel(1,"0x311350f1c7Ba0F1749572Cc8A948Dd7f9aF1f42a",[6, 4, 5] )

chooseStrategy(1, "0x12896191de42EF8388f2892Ab76b9a728189260A", 1)

chooseStrategy(1, "0x311350f1c7Ba0F1749572Cc8A948Dd7f9aF1f42a", 3)

fight(1)

getDuelInfo(1)

deposit("0x12896191de42EF8388f2892Ab76b9a728189260A", 1200);

withdraw("0x12896191de42EF8388f2892Ab76b9a728189260A", 200)

transferToken("0x12896191de42EF8388f2892Ab76b9a728189260A", "0x311350f1c7Ba0F1749572Cc8A948Dd7f9aF1f42a", 300)


listCharacter("0x12896191de42EF8388f2892Ab76b9a728189260A", 1, 330);

modifyListPrice("0x12896191de42EF8388f2892Ab76b9a728189260A", 1, 300);

BuyCharacter( 1, "0x311350f1c7Ba0F1749572Cc8A948Dd7f9aF1f42a");