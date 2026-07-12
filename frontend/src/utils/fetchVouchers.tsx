/**
 * Voucher reads + on-chain execution (Cartesi Rollups v2).
 *
 * v2 replaced CartesiDApp.executeVoucher(destination, payload, proof) with
 * Application.executeOutput(output, proof) where proof is
 * { outputIndex, outputHashesSiblings }.
 */
import { ethers } from "ethers";
import { listVouchers, VoucherInfo } from "./cartesi";

export type Voucher = {
  index: number;
  payload: string;
  destination: string;
  value: string;
  executed: boolean;
  proofReady: boolean;
  rawData: string;
  outputHashesSiblings: string[] | null;
};

export async function fetchVouchers(): Promise<Voucher[]> {
  try {
    const vouchers: VoucherInfo[] = await listVouchers();
    return vouchers.map((v) => ({
      index: v.index,
      payload: v.payload,
      destination: v.destination,
      value: v.value,
      executed: v.executed,
      proofReady: v.proofReady,
      rawData: v.rawData,
      outputHashesSiblings: v.outputHashesSiblings,
    }));
  } catch (error) {
    console.error("Error fetching vouchers via JSON-RPC:", error);
    return [];
  }
}

const APPLICATION_ABI = [
  "function executeOutput(bytes output, (uint64 outputIndex, bytes32[] outputHashesSiblings) proof) external",
  "function wasOutputExecuted(uint256 outputIndex) view returns (bool)",
];

/**
 * Execute a voucher on L1 via the v2 Application contract.
 * Requires the epoch containing the voucher to have an accepted claim
 * (proofReady === true).
 */
export async function executeVoucherOnchain(
  appAddress: string,
  voucher: Voucher,
  signer: ethers.Signer,
): Promise<ethers.ContractReceipt> {
  if (!voucher.proofReady || !voucher.outputHashesSiblings) {
    throw new Error(
      "Voucher proof is not available yet — wait for the epoch claim to be accepted.",
    );
  }
  const app = new ethers.Contract(appAddress, APPLICATION_ABI, signer);

  const alreadyExecuted = await app.wasOutputExecuted(voucher.index);
  if (alreadyExecuted) {
    throw new Error("This voucher has already been executed.");
  }

  const tx = await app.executeOutput(voucher.rawData, {
    outputIndex: voucher.index,
    outputHashesSiblings: voucher.outputHashesSiblings,
  });
  return tx.wait();
}
