import { hexToString } from "viem";

const JSON_RPC_URL = "http://127.0.0.1:6751/rpc";
const APPLICATION_ADDRESS = import.meta.env.VITE_DAPP_ADDRESS;

type CartesiOutput = {
  decoded_data?: {
    type: "Notice" | "Voucher";
    payload?: string;
    [key: string]: any;
  };
  [key: string]: any;
};

async function fetchNotices(request: string) {
  console.log("Fetching notices for request: ", request, APPLICATION_ADDRESS);
  try {
    console.log("Fetching notices from JSON-RPC URL: ", JSON_RPC_URL);
    const response = await fetch(JSON_RPC_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        method: "cartesi_listOutputs",
        params: {
          application: APPLICATION_ADDRESS,
          limit: 1000,
          offset: 0,
        },
        id: 1,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const result = await response.json();
    const outputs: CartesiOutput[] = result?.result?.data ?? [];

    const specific_tx: any[] = [];
    const all_tx: any[] = [];

    for (const output of outputs) {
      const decoded = output.decoded_data;
      if (!decoded || decoded.type !== "Notice" || !decoded.payload) continue;
      console.log("Decoded payload: ", decoded.payload);
      const tx = JSON.parse(hexToString(decoded.payload as `0x${string}`));
      console.log("Tx: ", tx);
      if (tx.notice_type === "specific_tx") {
        specific_tx.push(tx);
      } else {
        all_tx.push(tx);
      }
    }

    if (request === "all_profiles") {
      return fetch_profiles(specific_tx);
    } else if (request === "all_characters") {
      return fetch_characters(specific_tx);
    } else if (request === "all_duels") {
      return fetch_duels(specific_tx);
    } else if (request === "all_tx") {
      return fetch_all_tx(all_tx);
    } else if (request === "ai_duels") {
      return fetch_ai_duels(specific_tx);
    }
    return [];
  } catch (error) {
    console.error("Error fetching notices via JSON-RPC:", error);
    return [];
  }
}

function fetch_profiles(specific_tx: any) {
  console.log("Fetching profiles 1....");
  if (!specific_tx || specific_tx.length === 0) {
    return [];
  }

  const player_profiles = specific_tx.filter(
    (tx: any) =>
      tx.method == "deposit" ||
      tx.method == "create_player" ||
      tx.method == "withdraw" ||
      tx.method == "transfer_tokens" ||
      tx.method == "purchase_team"
  );
  if (player_profiles.length === 0) {
    return [];
  }

  let highest_id = player_profiles[0];
  for (let i = 0; i < player_profiles.length; i++) {
    if (player_profiles[i].tx_id > highest_id.tx_id) {
      highest_id = player_profiles[i];
    }
  }
  // console.log("All Player Profiles: ", JSON.parse(highest_id?.data));
  return highest_id.data ? JSON.parse(highest_id.data) : [];
}

function fetch_characters(specific_tx: any) {
  // console.log(specific_tx);
  const all_characters = specific_tx.filter(
    (tx: any) => tx.method == "purchase_team"
  );
  let highest_id;
  for (let i = 0; i < all_characters.length; i++) {
    highest_id = all_characters[i];
    if (all_characters[i].tx_id > highest_id) {
      highest_id = all_characters[i].tx_id;
    }
  }
  // console.log("All Player Characters: ", JSON.parse(highest_id?.data));
  return highest_id?.data ? JSON.parse(highest_id?.data) : [];
}

function fetch_duels(specific_tx: any) {
  console.log(specific_tx);
  const all_duels = specific_tx.filter(
    (tx: any) =>
      tx.method == "create_duel" ||
      tx.method == "set_strategy" ||
      tx.method == "fight" ||
      tx.method == "create_ai_duel" ||
      tx.method == "select_ai_battle_strategy"
  );
  console.log("all duels are:", all_duels);
  let highest_id = all_duels[0];

  for (let i = 0; i < all_duels.length; i++) {
    // highest_id = all_duels[i];
    console.log(JSON.parse(all_duels[i].data)[i]);
    if (all_duels[i].tx_id > highest_id.tx_id) {
      console.log("yessss");
      highest_id = all_duels[i];
    } else {
      console.log("no");
    }
  }
  // console.log("All Player Characters: ", JSON.parse(highest_id));
  console.log("All Player Characters: ", JSON.parse(highest_id.data));
  return highest_id?.data ? JSON.parse(highest_id?.data) : [];
}

function fetch_ai_duels(specific_tx: any) {
  console.log("Specific TX:  -----------------------------------> ", specific_tx);
  const all_duels = (specific_tx ?? []).filter(
    (tx: any) => tx.method === "create_ai_duel",
  );
  if (all_duels.length === 0) {
    return [];
  }

  console.log("All AI Duels:  -----------------------------------> ", all_duels);

  const all_ai_duels: any[] = [];
  for (let i = 0; i < all_duels.length; i++) {
    try {
      const parsed = JSON.parse(all_duels[i].data);
      const first = Array.isArray(parsed) ? parsed[0] : parsed;

      if (first != null) all_ai_duels.push(first);
    } catch {
      // skip malformed entry
    }
  }
  console.log("All AI Duels2222:  -----------------------------------> ", all_ai_duels);

  let highest_id = all_duels[0];
  for (let i = 0; i < all_duels.length; i++) {
    const data = all_duels[i]?.data;
    const parsed = JSON.parse(data);
    const parsed_array = Array.isArray(parsed) ? parsed : [parsed];

    const highest_id_parsed = JSON.parse(highest_id?.data);
    const highest_id_parsed_array = Array.isArray(highest_id_parsed) ? highest_id_parsed : [highest_id_parsed];

    
    if (parsed_array.length > highest_id_parsed_array.length) {
      highest_id = all_duels[i];
    }
  }


  try {
    const data = highest_id?.data;
    if (data == null || data === "") return all_ai_duels;
    const parsed = JSON.parse(data);
    console.log("All AI Duels Parsed:  -----------------------------------> ", parsed);
    return Array.isArray(parsed) ? parsed : [parsed];
  } catch {
    return all_ai_duels;
  }
}

function fetch_all_tx(all_tx: any) {
  console.log(all_tx);
  let highest_id;
  for (let i = 0; i < all_tx.length; i++) {
    highest_id = all_tx[i];
    if (all_tx[i].tx_id > highest_id) {
      highest_id = all_tx[i].tx_id;
    }
  }
  // console.log("All Player Characters: ", JSON.parse(highest_id?.data));
  // console.log("All Player Characters: ", (highest_id));
  return highest_id?.data ? JSON.parse(highest_id?.data) : [];
}

export default fetchNotices;
