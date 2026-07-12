import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { readGameState } from "@/lib/cartesi/inspect";
import { useProfileContext, type Profile } from "@/providers/ProfileProvider";
import { useWallet } from "./useWallet";

/**
 * Live profile for the connected wallet. Reads `profile/<addr>` via inspect,
 * mirrors it into ProfileContext (so e.g. WalletHUD can read it without
 * re-fetching), and reports whether the wallet has registered a player yet.
 */
export function useProfile() {
  const { address } = useWallet();
  const { setProfile } = useProfileContext();

  const query = useQuery({
    queryKey: ["profile", address],
    enabled: !!address,
    queryFn: async (): Promise<Profile | null> => {
      const res = await readGameState(`profile/${address}`);
      // profile/<addr> returns the object on success, or an error string when
      // the wallet has no player yet → treat that as "no profile".
      return res.Status && res.request_payload && typeof res.request_payload === "object"
        ? (res.request_payload as Profile)
        : null;
    },
  });

  useEffect(() => {
    if (!address) {
      setProfile(null);
      return;
    }
    if (query.data !== undefined) setProfile(query.data);
  }, [address, query.data, setProfile]);

  return {
    address,
    profile: query.data ?? null,
    hasProfile: !!query.data,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    refetch: query.refetch,
  };
}
