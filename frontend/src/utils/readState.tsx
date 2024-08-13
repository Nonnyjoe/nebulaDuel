import axios from "axios";
import { hexToString } from "viem";

async function readGameState(data: any) {
  console.log("Inspecting state from Cartesi........");
  try {
    // const response = await axios.get( `https://nebuladuel.fly.dev/inspect/${data}`, {
    const response = await axios.get(`http://localhost:8080/inspect/${data}`, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    console.log("Transaction successful:", response.data);
    const { Status, request_payload } = destructureResponse(
      response.data.reports,
      data
    );
    console.log(Status, request_payload);
    return { Status, request_payload };
  } catch (error: any) {
    console.error(
      "Error sending transaction:",
      error.response ? error.response.data : error.message
    );
    return { Status: false, request_payload: error.message };
  }
}

function destructureResponse(reports: any, data: any) {
  if (data.includes("/")) {
    console.log("returning a single response");
    if (data.includes("players_characters")) {
      console.log("fetching all characters belonging to user.....");
      // console.log(reports[0].payload);
      const payload = hexToArray(reports[0].payload);
      // console.log(payload);
      return { Status: true, request_payload: payload };
    } else if (data.includes("get_duel_characters")) {
      // console.log("fetching characters participating in duel......");
      // console.log(reports[0].payload);
      const payload = hexToArray(reports[0].payload);
      return { Status: true, request_payload: payload };
    }
    // console.log(reports[0].payload);
    if (reports[0].payload) {
      let payload = hexToString(reports[0].payload);
      payload = JSON.parse(`{${payload}`);
      return { Status: true, request_payload: payload };
    } else {
      return { Status: false, request_payload: "Empty response" };
    }
  } else {
    if (data.includes("check_relayed_dapp_address")) {
      return { Status: true, request_payload: hexToString(reports[0].payload) };
    } else {
      // console.log(reports[0].payload);
      const payload = hexToArray(reports[0].payload);
      return { Status: true, request_payload: payload };
    }
  }
}

function hexToArray(hexString: any) {
  const jsonString = `[${hexToString(hexString)}`;
  // console.log(jsonString);
  const data = JSON.parse(jsonString);
  return data;
}

export default readGameState;
