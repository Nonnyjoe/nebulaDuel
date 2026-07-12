import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { fetchVouchers, executeVoucherOnchain, type Voucher } from "@/lib/cartesi/vouchers";
import { APPLICATION_ADDRESS } from "@/lib/cartesi/client";
import { getBrowserSigner } from "@/lib/cartesi/signer";

export function useVouchers() {
  return useQuery({ queryKey: ["vouchers"], queryFn: fetchVouchers, staleTime: 8_000 });
}

/** Execute a withdrawal voucher on L1 (requires an accepted epoch claim). */
export function useExecuteVoucher() {
  const [pending, setPending] = useState(false);
  const execute = async (voucher: Voucher) => {
    setPending(true);
    const id = toast.loading("Executing voucher on-chain…");
    try {
      const receipt = await executeVoucherOnchain(APPLICATION_ADDRESS, voucher, getBrowserSigner());
      toast.success("Voucher executed — funds released", { id });
      return receipt;
    } catch (e: any) {
      toast.error(e?.reason ?? e?.message ?? "Voucher execution failed", { id });
      throw e;
    } finally {
      setPending(false);
    }
  };
  return { execute, pending };
}
