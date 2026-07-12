/**
 * Read hooks — thin TanStack Query wrappers over the inspect/JSON-RPC layer.
 * Every hook yields { data, isLoading, isError } so screens can gate display on
 * the live node response (loading / empty / error / data).
 */
import { useCallback, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  fetchAllCharacters,
  fetchPlayerCharacters,
  fetchListings,
  fetchMarketInfo,
} from "@/lib/cartesi/market";
import {
  fetchCampaignLevels,
  fetchCampaignProgress,
  fetchCampaignLeaderboard,
  fetchPvpLeaderboard,
  fetchAchievements,
  fetchCharmCatalog,
} from "@/lib/cartesi/game-types";
import { readGameState } from "@/lib/cartesi/inspect";
import { fetchDuels } from "@/lib/cartesi/duels";

export type { DuelRow } from "@/lib/cartesi/duels";

const LISTY = { staleTime: 4_000 } as const;

export function useAllCharacters() {
  return useQuery({ queryKey: ["characters"], queryFn: fetchAllCharacters, ...LISTY });
}

export function usePlayerCharacters(wallet: string | null) {
  return useQuery({
    queryKey: ["players_characters", wallet],
    enabled: !!wallet,
    queryFn: () => fetchPlayerCharacters(wallet!),
    ...LISTY,
  });
}

export function useListings() {
  return useQuery({ queryKey: ["listed_characters"], queryFn: fetchListings, ...LISTY });
}

export function useMarketInfo(wallet?: string | null) {
  return useQuery({
    queryKey: ["market_info", wallet ?? null],
    queryFn: () => fetchMarketInfo(wallet ?? undefined),
    ...LISTY,
  });
}

export function useCharmCatalog() {
  return useQuery({ queryKey: ["charm_catalog"], queryFn: fetchCharmCatalog, ...LISTY });
}

export function useCampaignLevels() {
  return useQuery({ queryKey: ["campaign_levels"], queryFn: fetchCampaignLevels, staleTime: 60_000 });
}

export function useCampaignProgress(wallet: string | null) {
  return useQuery({
    queryKey: ["campaign", wallet],
    enabled: !!wallet,
    queryFn: () => fetchCampaignProgress(wallet!),
    ...LISTY,
  });
}

export function usePvpLeaderboard() {
  return useQuery({ queryKey: ["pvp_leaderboard"], queryFn: fetchPvpLeaderboard, ...LISTY });
}

export function useCampaignLeaderboard() {
  return useQuery({ queryKey: ["campaign_leaderboard"], queryFn: fetchCampaignLeaderboard, ...LISTY });
}

export function useAchievements(wallet: string | null) {
  return useQuery({
    queryKey: ["achievements", wallet],
    enabled: !!wallet,
    queryFn: () => fetchAchievements(wallet!),
    ...LISTY,
  });
}

// ---------------------------------------------------------------------------
// Duels
// ---------------------------------------------------------------------------

export function useAvailableDuels() {
  return useQuery({ queryKey: ["available_duels"], queryFn: () => fetchDuels("available_duels"), ...LISTY });
}

export function useAllDuels() {
  return useQuery({ queryKey: ["duels"], queryFn: () => fetchDuels("duels"), ...LISTY });
}

/** Warriors of a duel visible to a participant (get_duel_characters). */
export function useDuelCharacters(duelId: string | number | null, wallet: string | null) {
  return useQuery({
    queryKey: ["get_duel_characters", duelId, wallet],
    enabled: duelId != null && !!wallet,
    queryFn: async () => {
      const res = await readGameState(`get_duel_characters/${duelId}/${wallet}`);
      return res.Status && Array.isArray(res.request_payload) ? res.request_payload : [];
    },
    ...LISTY,
  });
}

// ---------------------------------------------------------------------------
// Player names (address → monika)
// ---------------------------------------------------------------------------

async function fetchAllProfiles(): Promise<{ wallet_address: string; monika: string }[]> {
  const res = await readGameState("profile");
  return res.Status && Array.isArray(res.request_payload) ? res.request_payload : [];
}

/**
 * Resolve wallet addresses to player usernames (monika). Returns `nameFor(addr)`
 * which yields the monika when known, else "".
 */
export function usePlayerNames() {
  const query = useQuery({ queryKey: ["profiles"], queryFn: fetchAllProfiles, staleTime: 30_000 });

  const map = useMemo(() => {
    const m = new Map<string, string>();
    for (const p of query.data ?? []) {
      if (p?.wallet_address && p?.monika) m.set(p.wallet_address.toLowerCase(), p.monika);
    }
    return m;
  }, [query.data]);

  const nameFor = useCallback(
    (addr?: string) => (addr ? map.get(addr.toLowerCase()) ?? "" : ""),
    [map],
  );

  return { nameFor, map, isLoading: query.isLoading };
}
