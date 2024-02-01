// XXX even though ethers is not used in the code below, it's very likely
// it will be used by any DApp, so we are already including it here
const { ethers } = require("ethers");
const { viem } = require("viem");
const playersProfile = require("./players_profile");
const gameCharacters = require("./game_characters");
const battleChallenge = require("./battle_challenge");
const marketplace = require("./marketplace");
var erc20abi = require("../utils/contract.json");
// const { allPlayers, createPlayer, Player, totalPlayers } = playersProfile;
// const { allCharacters, totalCharacters, Character, createTeam, resolveCharacters} = gameCharacters;


const rollup_server = process.env.ROLLUP_HTTP_SERVER_URL;
console.log("HTTP rollup_server url is " + rollup_server);
const DAPP_ADDRESS_REALY = "0xF5DE34d6BbC0446E2a45719E718efEbaaE179daE";
const ERC_20_PORTAL = "0x9C21AEb2093C32DDbC53eEF24B873BDCd1aDa1DB";
const ERC_721_PORTAL = "0x237F8DD094C0e47f4236f12b4Fa01d6Dae89fb87";
const nebula_token_address = "";
let DAPP_ADDRESS = "null";
let totalTransactions = 0;

emitNotice = async (data) => {
  const hexresult = stringToHex(data);
  advance_req = await fetch(rollup_server + "/notice", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ payload: hexresult }),
  });
  return advance_req;
}


async function handle_advance(data) {
  console.log("Received advance request data " + JSON.stringify(data));
  const payload = data.payload;
  let JSONpayload = {};
  try {
    if (
      String(data.metadata.msg_sender).toLowerCase() ===
      DAPP_ADDRESS_REALY.toLowerCase()
    ) {
      console.log("setting Dapp address:", payload);
      DAPP_ADDRESS = payload;
    }

    if (
      String(data.metadata.msg_sender).toLowerCase() ===
      ERC_20_PORTAL.toLowerCase()
    ) {
      try {
        let payloads = marketplace.erc20_deposit_process(payload);
        const hexresult = stringToHex(payloads);
        console.log("The result is :", hexresult);
        advance_req = await fetch(rollup_server + "/notice", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ payload: hexresult }),
        });
      } catch (e) {
        return new Error_out(`failed to process ERC20 deposti ${payload} ${e}`);
      }
    }

    console.log("payload:" + JSON.stringify(payload));
    const payloadStr = ethers.toUtf8String(payload);
    JSONpayload = JSON.parse(payloadStr);
    console.log(`received request ${JSON.stringify(JSONpayload)}`);

  } catch (e) {

    console.log("error is:", e);
    console.log(`Adding notice with binary value "${payload}"`);
    await fetch(rollup_server + "/report", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ payload: payload }),
    });
    return "reject";
  }
   
  let advance_req;
  try {
     //{"method":"create_profile","name":"0xreadyPlayer1","avatarURI":"X7sdsa8ycn"}
    if (JSONpayload.method === "create_profile") {
        console.log("creating profile....");
        const createdProfile = playersProfile.createPlayer(
          JSONpayload.name,
          data.metadata.msg_sender,
          JSONpayload.avatarURI,
        );
        console.log("created profile is:", createdProfile);

        totalTransactions++

      // return an updated array of all players
      let allPlayers = playersProfile.allPlayers;
      const result = JSON.stringify({"method": "all_Players", "txId": totalTransactions, "target": data.metadata.msg_sender, "data": allPlayers });
      advance_req = await emitNotice(result);


    //{"method":"get_profile", "user": "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266"}
    // NOTE: replace the address in user above with your own address.
    } else if(JSONpayload.method === "get_profile"){
      let userProfile = playersProfile.getProfile(ethers.getAddress(JSONpayload.user));
      console.log("getting  profile....");
      console.log("player profile: " + JSON.stringify(userProfile)); 
    }

    //{"method":"create_team","char1": 1,"char2": 8, "char3": 5}
    else if (JSONpayload.method === "create_team") {
      console.log("creating team...");
      let characters = gameCharacters.createTeam(
        data.metadata.msg_sender,
        gameCharacters.resolveCharacters(parseInt(JSONpayload.char1, 10)),
        gameCharacters.resolveCharacters(parseInt(JSONpayload.char2, 10)),
        gameCharacters.resolveCharacters(parseInt(JSONpayload.char3, 10))
      ); 
      
      totalTransactions++;
      // return an updated array of all players
      let allPlayers = playersProfile.allPlayers;

      totalTransactions++
      const result = JSON.stringify({"method": "all_Players", "txId": totalTransactions, "target": data.metadata.msg_sender, "data": allPlayers });
      advance_req = await emitNotice(result);
      
      // return array of all characters
      let allCharacters = gameCharacters.allCharacters;
      const result2 = JSON.stringify({ "method":"all_character", "txId": totalTransactions, "target": data.metadata.msg_sender, "data": allCharacters });
      
      advance_req = await emitNotice(result2);
      console.log("Character Purchased are:" + JSON.stringify(allCharacters));
    }

    //{"method": "create_duel", "selectedCharacters": [2, 1, 3]}
    else if (JSONpayload.method === "create_duel") {
      console.log("creating a duel.....");
      let newDuel = battleChallenge.createDuel(data.metadata.msg_sender, JSONpayload.selectedCharacters);
      console.log("New duel created, duel data is:" + JSON.stringify(newDuel));

      totalTransactions++

      // Return all the available duels
      let allDuel = battleChallenge.allDuels;
      const result = JSON.stringify({"method": "all_duels", "txId": totalTransactions, "target": data.metadata.msg_sender, "data": allDuel });
      advance_req = await emitNotice(result);
    }

    //{"method": "join_duel", "duelId": 1 , "selectedCharacters": [4, 5, 6]}
    else if (JSONpayload.method === "join_duel") {
      console.log("Joining an existing duel....");
      let bothWarriors = battleChallenge.joinDuel(JSONpayload.duelId, data.metadata.msg_sender, JSONpayload.selectedCharacters);
      console.log("Join successfully, competing characters are: " + JSON.stringify(bothWarriors));

      // // emit a notice of the duel data
      // let duelData = battleChallenge.displayDuelInfo(JSONpayload.dielId);
      // console.log("Duel data is: " + JSON.stringify(duelData));

      totalTransactions++

      // Return all the available duels
      let allDuel = battleChallenge.allDuels;
      const result = JSON.stringify({"method": "all_duels", "txId": totalTransactions, "target": data.metadata.msg_sender, "data": allDuel });
      advance_req = await emitNotice(result);
    }

    //{"method":"set_strategy", "duelId": 1, "strategy": 1}
    //{"method":"set_strategy", "duelId": 1, "strategy": 3}
    else if (JSONpayload.method === "set_strategy") {
      console.log("setting strategy....");
      let duel = battleChallenge.setStrategy(JSONpayload.duelId, data.metadata.msg_sender, JSONpayload.strategy);
      console.log("New strategy set for duel: " + JSON.stringify(duel));
      
      totalTransactions++

      // Return all the available duels
      let allDuel = battleChallenge.allDuels;
      const result = JSON.stringify({"method": "all_duels", "txId": totalTransactions, "target": data.metadata.msg_sender, "data": allDuel });
      advance_req = await emitNotice(result);
    }

    //{"method":"fight", "duelId": 1}
    else if (JSONpayload.method === "fight") {
      console.log("fighting....");
      let duel = battleChallenge.fight(JSONpayload.duelId);
      console.log("winner is: " + JSON.stringify(duel));

      totalTransactions++
      // Return all the available duels
      let allDuel = battleChallenge.allDuels;
      const result = JSON.stringify({"method": "all_duels", "txId": totalTransactions, "target": data.metadata.msg_sender, "data": allDuel });
      advance_req = await emitNotice(result);

      // return array of all characters
      let allCharacters = gameCharacters.allCharacters;
      const result2 = JSON.stringify({ "method":"all_character", "txId": totalTransactions, "target": data.metadata.msg_sender, "data": allCharacters });
      advance_req = await emitNotice(result2);

      // return an updated array of all players
      let allPlayers = playersProfile.allPlayers;
      const result3 = JSON.stringify({"method": "all_Players", "txId": totalTransactions, "target": data.metadata.msg_sender, "data": allPlayers });
      advance_req = await emitNotice(result3);
    }

    //{"method": "getCharacterDetails", "characterId": 1}
    else if (JSONpayload.method === "getCharacterDetails") {
      console.log("getting CharacterDetails....");
      let characterDetails = gameCharacters.getCharacterDetails(JSONpayload.characterId);
      console.log("character Details is: " + JSON.stringify(characterDetails));
      advance_req = await emitNotice(characterDetails);

    }

    //{"method": "allCharacters"}
    else if (JSONpayload.method === "allCharacters") {
      console.log("getting allCharacters....");
      let allCharacters = gameCharacters.allCharacters;
      console.log("allCharacters Details is: " + JSON.stringify(allCharacters));
      const hexresult = stringToHex(JSON.stringify(allCharacters));
      advance_req = await fetch(rollup_server + "/notice", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ payload: hexresult }),
      });
    }

    //{"method": "transferTokens", receiver: "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266" , amount: 1000}
    else if (JSONpayload.method === "transferTokens") {
      console.log("Transfering tokens.....");
      let transferTokens = marketplace.transferToken(data.metadata.msg_sender, JSONpayload.receiver , JSONpayload.amount);
      
      // return an updated array of all players
      let allPlayers = playersProfile.allPlayers;

      totalTransactions++
      const result = JSON.stringify({"method": "all_Players", "txId": totalTransactions, "target": data.metadata.msg_sender, "data": allPlayers });
      advance_req = await emitNotice(result);
    }

  //{"method": "listCharacter", characterId: 2 , amount: 1000}
    else if (JSONpayload.method === "listCharacter") {
      console.log("getting listCharacter....");
      let listCharacter = marketplace.listCharacter(data.metadata.msg_sender, JSONpayload.characterId , JSONpayload.amount);
      console.log("listCharacter Details is: " + JSON.stringify(listCharacter));

      // Return a list of all Listed Characters.
      totalTransactions++
      let listedCharacters = marketplace.listedCharacters;
      const result = JSON.stringify({"method": "listed_characters", "txId": totalTransactions, "target": data.metadata.msg_sender, "data": listedCharacters });
      advance_req = await emitNotice(result);
    }

    //{"method": "modifyListPrice", characterId: 2, amount: 1000}
    else if (JSONpayload.method === "modifyListPrice") {
      console.log("modifying listPrice....");
      let modifyListPrice = marketplace.modifyListPrice(data.metadata.msg_sender, JSONpayload.characterId, JSONpayload.amount);
      console.log("modifyListPrice Details is: " + JSON.stringify(modifyListPrice));
      
      // Return a list of all Listed Characters.
      totalTransactions++
      let listedCharacters = marketplace.listedCharacters;
      const result = JSON.stringify({"method": "listed_characters", "txId": totalTransactions, "target": data.metadata.msg_sender, "data": listedCharacters });
      advance_req = await emitNotice(result);
    }

    // {"method": "buyCharacters", "characterId": 2}
    else if (JSONpayload.method === "buyCharacters") {
      console.log("buying characters....");
      let purchaseResult = marketplace.BuyCharacter(JSONpayload.characterId, data.metadata.msg_sender);
      console.log("buyCharacters Details is: " + JSON.stringify(purchaseResult));

      // return an updated array of all players
      let allPlayers = playersProfile.allPlayers;

      totalTransactions++
      const result = JSON.stringify({"method": "all_Players", "txId": totalTransactions, "target": data.metadata.msg_sender, "data": allPlayers });
      advance_req = await emitNotice(result);

      // return array of all characters
      let allCharacters = gameCharacters.allCharacters;
      const result2 = JSON.stringify({ "method":"all_character", "txId": totalTransactions, "target": data.metadata.msg_sender, "data": allCharacters });
      advance_req = await emitNotice(result2);

      // Return a list of all Listed Characters.
      let listedCharacters = marketplace.listedCharacters;
      const result3 = JSON.stringify({"method": "listed_characters", "txId": totalTransactions, "target": data.metadata.msg_sender, "data": listedCharacters });
      advance_req = await emitNotice(result3);
    }

    //{"method": "withdraw", amount: 1000}
    else if (JSONpayload.method === "withdraw") {
      console.log("withdrawing....");
      if (DAPP_ADDRESS === "null") {
        console.log("Dapp address is not set");
        return "reject";
      }
      let withdraw = marketplace.withdraw(data.metadata.msg_sender, parseInt(JSONpayload.amount));
      console.log("withdraw is: " + JSON.stringify(withdraw));
      // return an updated array of all players
      let allPlayers = playersProfile.allPlayers;

      totalTransactions++
      const result = JSON.stringify({"method": "all_Players", "txId": totalTransactions, "target": data.metadata.msg_sender, "data": allPlayers });
      advance_req = await emitNotice(result);

      // EMIT A VOUCHER TO BE PROCESSED ON L1
      const call = viem.encodeFunctionData({
        abi: erc20abi,
        functionName: "transfer",
        args: [data.metadata.msg_sender, BigInt(JSONpayload.value)],
      });
      let voucher = {
        destination: nebula_token_address, // Nebula token Address
        payload: call,
      };
      console.log(voucher);
      advance_req = await fetch(rollup_server + "/voucher", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(voucher),
      });
      console.log("starting a voucher");
    }


    else {
      console.log("method undefined");
      const result = JSON.stringify({
        error: String("method undefined:" + JSONpayload.method),
      });
      const hexresult = stringToHex(result);
      await fetch(rollup_server + "/report", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          payload: hexresult,
        }),
      });
    }
  } catch (e) {
    console.log("error is:", e);
    await fetch(rollup_server + "/report", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        payload: stringToHex(JSON.stringify({ error: e })),
      }),
    });
    return "reject";
  }

  const json = await advance_req.json();
  console.log(
    "Received  status " +
      advance_req.status +
      " with body " +
      JSON.stringify(json)
  );
  return "accept";

}

async function handle_inspect(data) {
  console.log("Received inspect request data " + JSON.stringify(data));
  return "accept";
}

// convert string to hex
function stringToHex(str) {
  let hex = "";
  for (let i = 0; i < str.length; i++) {
    const charCode = str.charCodeAt(i).toString(16);
    hex += charCode.padStart(2, '0'); // Ensure each byte is represented by two characters
  }
  return `0x${hex}`;
}

var handlers = {
  advance_state: handle_advance,
  inspect_state: handle_inspect,
};

var finish = { status: "accept" };

(async () => {
  while (true) {
    const finish_req = await fetch(rollup_server + "/finish", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status: "accept" }),
    });

    console.log("Received finish status " + finish_req.status);

    if (finish_req.status == 202) {
      console.log("No pending rollup request, trying again");
    } else {
      const rollup_req = await finish_req.json();
      var handler = handlers[rollup_req["request_type"]];
      finish["status"] = await handler(rollup_req["data"]);
    }
  }
})();