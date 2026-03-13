export type Voucher = {
  index: number;
  payload: string;
  destination: string;
  proof: any;
};

const JSON_RPC_URL = "http://127.0.0.1:6751/rpc";
const APPLICATION_NAME = "nebula-duel";

export async function fetchVouchers() {
  try {
    const response = await fetch(JSON_RPC_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        method: "cartesi_listOutputs",
        params: {
          application: APPLICATION_NAME,
          limit: 1000,
          offset: 0,
        },
        id: 2,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const result = await response.json();
    const outputs = result?.result?.data ?? [];

    const all_Vouchers: Voucher[] = [];

    for (let i = 0; i < outputs.length; i++) {
      const decoded = outputs[i]?.decoded_data;
      if (!decoded || decoded.type !== "Voucher") continue;

      all_Vouchers.push({
        index:
          typeof outputs[i]?.index === "string"
            ? parseInt(outputs[i].index, 16)
            : i,
        payload: decoded.payload,
        destination: decoded.destination,
        proof: decoded.proof,
      });
    }

    return all_Vouchers;
  } catch (error) {
    console.error("Error fetching vouchers via JSON-RPC:", error);
  }
}
