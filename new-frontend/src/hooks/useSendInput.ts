import { useCallback, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { sendInput, type SendInputResult } from "@/lib/cartesi/inputs";
import { pollUntil, clearInspectCache } from "@/lib/cartesi/client";

export interface VerifyOptions {
  /** A fresh inspect-backed read (the poller busts the read cache each attempt). */
  check: () => Promise<unknown>;
  /** Returns true once the expected state change is visible on-chain. */
  until: (value: any) => boolean;
  /** Toast text shown while confirming. */
  label?: string;
  /** Max time to wait for the state to become visible (default 90s). */
  timeoutMs?: number;
}

export interface SendOptions {
  pendingMsg?: string;
  successMsg?: string;
  /** Extra react-query keys to invalidate after the input is processed. */
  invalidate?: (string | unknown[])[];
  /**
   * After the input is ACCEPTED, confirm the expected state change is actually
   * visible via inspect before resolving — so dependent pages never read stale
   * or empty state. Bounded poll, not a one-shot retry.
   */
  verify?: VerifyOptions;
}

function humanizeError(e: any): string {
  if (e?.code === 4001 || /user rejected|user denied/i.test(e?.message ?? "")) {
    return "Transaction rejected in wallet";
  }
  const msg = e?.reason ?? e?.message ?? String(e);
  return String(msg).slice(0, 180);
}

/**
 * One-call write flow used by every mutating action:
 *   submit InputBox.addInput → wait until the node processes it →
 *   invalidate affected reads → toast. `profile` is always refreshed.
 */
export function useSendInput() {
  const qc = useQueryClient();
  const [pending, setPending] = useState(false);

  const send = useCallback(
    async (
      func: string,
      fields: Record<string, unknown> = {},
      opts: SendOptions = {},
    ): Promise<SendInputResult> => {
      setPending(true);
      const toastId = toast.loading(opts.pendingMsg ?? "Submitting transaction…");
      try {
        const result = await sendInput(func, fields);

        // The node consumed the input, but the dapp may have REJECTED it
        // (e.g. insufficient funds). Treat rejection as a failure so dependent
        // navigations don't proceed on a false success.
        if (!result.accepted) {
          const msg = result.error ?? "Transaction was rejected on-chain.";
          toast.error(msg, { id: toastId });
          throw new Error(msg);
        }

        const invalidate = () => {
          for (const key of ["profile", ...(opts.invalidate ?? [])]) {
            qc.invalidateQueries({ queryKey: Array.isArray(key) ? key : [key] });
          }
        };

        // Optional second confirmation: poll inspect until the expected state
        // change is actually visible, so dependent pages don't read stale data.
        if (opts.verify) {
          toast.loading(opts.verify.label ?? "Confirming on-chain state…", { id: toastId });
          const confirmed = await pollUntil(
            opts.verify.check,
            opts.verify.until as (v: unknown) => boolean,
            { timeoutMs: opts.verify.timeoutMs, beforeEach: clearInspectCache },
          );
          invalidate();
          if (confirmed) {
            toast.success(opts.successMsg ?? "Confirmed on-chain", { id: toastId });
          } else {
            // Input was ACCEPTED (authoritative) but the change isn't visible
            // yet — proceed without failing, just flag the lag.
            toast.warning("Accepted — the update is taking a little longer to appear.", { id: toastId });
          }
          return result;
        }

        invalidate();
        toast.success(opts.successMsg ?? "Confirmed on-chain", { id: toastId });
        return result;
      } catch (e) {
        toast.error(humanizeError(e), { id: toastId });
        if (e && typeof e === "object") (e as { toasted?: boolean }).toasted = true;
        throw e;
      } finally {
        setPending(false);
      }
    },
    [qc],
  );

  return { send, pending };
}
