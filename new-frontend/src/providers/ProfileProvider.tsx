import {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from "react";

/**
 * Shape of the backend `profile/<addr>` inspect payload
 * (single_player_profile_to_json in app/src/players_profile). Extra campaign
 * fields are optional so older machines still parse.
 */
export interface Profile {
  id: number;
  monika: string;
  points: number;
  avatar_url: string;
  wallet_address: string;
  cartesi_token_balance: number;
  nebula_token_balance: number;
  characters: string | number[];
  total_battles: number;
  total_wins: number;
  total_losses: number;
  total_ai_battles: number;
  ai_battles_won: number;
  ai_battles_losses: number;
  transaction_history: string;
  campaign_progress?: number;
  campaign_wins?: number;
  campaign_losses?: number;
  titles?: string[];
  [key: string]: unknown;
}

interface ProfileContextValue {
  profile: Profile | null;
  setProfile: (next: Profile | null) => void;
}

const ProfileContext = createContext<ProfileContextValue | undefined>(undefined);

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<Profile | null>(null);
  return (
    <ProfileContext.Provider value={{ profile, setProfile }}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfileContext(): ProfileContextValue {
  const ctx = useContext(ProfileContext);
  if (!ctx) {
    throw new Error("useProfileContext must be used within <ProfileProvider>");
  }
  return ctx;
}
