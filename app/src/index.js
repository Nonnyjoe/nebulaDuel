// XXX even though ethers is not used in the code below, it's very likely
// it will be used by any DApp, so we are already including it here
const { ethers } = require("ethers");
const { viem } = require("viem");
import * as playersProfile from "./players_profile"
import * as gameCharacters from "./game_characters";

const rollup_server = process.env.ROLLUP_HTTP_SERVER_URL;
console.log("HTTP rollup_server url is " + rollup_server);
const DAPP_ADDRESS_REALY = "0xF5DE34d6BbC0446E2a45719E718efEbaaE179daE";
let DAPP_ADDRESS = "null";


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

        const result = JSON.stringify({ createdProfile: createdProfile });
        // convert result to hex
        const hexresult = stringToHex(result);
        console.log("The result is :", hexresult);
        advance_req = await fetch(rollup_server + "/notice", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ payload: hexresult }),
        });

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
        gameCharacters.resolveCharacters(JSONpayload.char1),
        gameCharacters.resolveCharacters(JSONpayload.char2),
        gameCharacters.resolveCharacters(JSONpayload.char3)
      ); 
      const result1 = JSON.stringify({ purchasedCharacters: characters });
      console.log("Purchased Characters are:" + characters);
      const hexresult1 = stringToHex(result1);
      // console.log("result1 in hex is:", hexresult1);
      advance_req = await fetch(rollup_server + "/notice", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ payload: hexresult1 }),
      });

      let player = playersProfile.findPlayer(playersProfile.allPlayers, data.metadata.msg_sender);
      const result2 = JSON.stringify({ updatedProfile: player});
      console.log("players profile after purchase is:" + JSON.stringify(player));
      const hexresult2 = stringToHex(result2);
      // console.log("result2 in hex is:", hexresult2);
      advance_req = await fetch(rollup_server + "/notice", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ payload: hexresult2 }),
      });

    }
    
    //{"method":"decompress","id":"000c7899-96bb-498b-8820-691d5e04ba33"}
    else if (JSONpayload.method === "hash") {
      console.log("hashing....");
      const hash = keccak256(toUtf8Bytes(JSONpayload.data));
      console.log("hash is:", hash);

      advance_req = await fetch(rollup_server + "/notice", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ payload: hash }),
      });

    //{"method":"mint"}
    // } else if (JSONpayload.method === "faucet") {
    //   console.log("sending erc20 tokens.....");
    //   if (DAPP_ADDRESS === "null") {
    //     console.log("Dapp address is not set");
    //     return "reject";
    //   }
    //   // console.log("abi is", erc20abi);
    //   const call = viem.encodeFunctionData({
    //     abi: erc20abi,
    //     functionName: "transfer",
    //     args: [data.metadata.msg_sender, BigInt(JSONpayload.value)],
    //   });
    //   let voucher = {
    //     destination: erc20_contract_address, // dapp Address
    //     payload: call,
    //   };
    //   console.log(voucher);
    //   advance_req = await fetch(rollup_server + "/voucher", {
    //     method: "POST",
    //     headers: {
    //       "Content-Type": "application/json",
    //     },
    //     body: JSON.stringify(voucher),
    //   });
    //   console.log("starting a voucher");
    //{"method":"faucet","value":"150000"}

    } else {
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
