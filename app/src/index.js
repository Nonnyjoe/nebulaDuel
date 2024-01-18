// XXX even though ethers is not used in the code below, it's very likely
// it will be used by any DApp, so we are already including it here
const { ethers } = require("ethers");
const { viem } = require("viem");
const { createPlayer } = require("./players_profile.js");

const rollup_server = process.env.ROLLUP_HTTP_SERVER_URL;
console.log("HTTP rollup_server url is " + rollup_server);
const DAPP_ADDRESS_REALY = "0xF5DE34d6BbC0446E2a45719E718efEbaaE179daE";
let DAPP_ADDRESS = "null";


// let profile = {}

  // function create_profile(useraddress, name) {
  //   if (profile[useraddress] !== undefined) {
  //     console.log("profile already exists");
  //     return profile[useraddress];
  //   }

  //   profile[useraddress] = {
  //     addresss: useraddress,
  //     username: name,
  //     rank: 0,
  //     point: 1000,
  //     characters: [],
  //   }
  // }

  // function get_profile(useraddress) {
  //   return profile[useraddress];
  // }


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
        const createdProfile = createPlayer(
          JSONpayload.name,
          data.metadata.msg_sender,
          JSONpayload.avatarURI,
        );
        console.log("created profile is:", createdProfile);

        const result = JSON.stringify({ createdProfile: createdProfile });
        console.log("The result is :", result);
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

        //{"method":"get_profile"}
    } else if(JSONpayload.method === "get_profile"){
      console.log("getting  profile....");

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
      const hexresult = viem.stringToHex(result);
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
        payload: viem.stringToHex(JSON.stringify({ error: e })),
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
  return hex;
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
