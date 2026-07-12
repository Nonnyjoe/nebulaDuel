import React from "react";
import { useNavigate } from "react-router-dom";
import { useActiveAccount } from "thirdweb/react";
import readGameState from "../../utils/readState";


// Define the ProfileData type
interface ProfileData {
  monika: string;
  wallet_address: string;
  avatar_url: string;
  characters: string;
  id: number;
  cartesi_token_balance: number;
  // Add other properties if needed
}

interface DisplayDataProps {
  duel_id: number;
  duel_creator: string;
  creation_time: number;
  stake_amount: number;
  allPlayers: ProfileData[];
  duel_opponent: string;
  creators_strategy: string;
  opponent_strategy: string;
  is_completed: boolean;
  difficulty: string;
}

const DuelCard: React.FC<DisplayDataProps> = ({
  duel_id,
  duel_creator,
  creation_time,
  stake_amount,
  allPlayers,
  duel_opponent,
  creators_strategy,
  opponent_strategy,
  is_completed,
  difficulty,
}) => {
  const activeAccount = useActiveAccount()?.address?.toLowerCase();
  const navigate = useNavigate();

  const { baseName, baseAvatar } = React.useMemo(() => {
    const lowerCreator = typeof duel_creator === "string" ? duel_creator.trim().toLowerCase() : "";
    const list = Array.isArray(allPlayers) ? allPlayers : [];
    for (let i = 0; i < list.length; i++) {
      const p = list[i];
      const wallet = p?.wallet_address ? String(p.wallet_address).trim().toLowerCase() : "";
      if (wallet && wallet === lowerCreator) {
        const monika = p.monika != null ? String(p.monika).trim() : "";
        const avatar = p.avatar_url != null ? String(p.avatar_url).trim() : "";
        return { baseName: monika || "", baseAvatar: avatar };
      }
    }
    if (lowerCreator) {
      const short = lowerCreator.slice(0, 6) + "…" + lowerCreator.slice(-4);
      return { baseName: short, baseAvatar: "" };
    }
    return { baseName: "Unknown", baseAvatar: "" };
  }, [duel_creator, allPlayers]);

  const [creatorName, setCreatorName] = React.useState<string>(baseName);
  const [creatorAvatar, setCreatorAvatar] = React.useState<string>(baseAvatar);

  React.useEffect(() => {
    setCreatorName(baseName);
    setCreatorAvatar(baseAvatar);
  }, [baseName, baseAvatar]);

  React.useEffect(() => {
    let cancelled = false;
    const loadProfile = async () => {
      if (!duel_creator) return;
      try {
        const addr = duel_creator.toLowerCase();
        const { Status, request_payload } = await readGameState(`profile/${addr}`);
        if (!cancelled && Status && request_payload) {
          const monika = request_payload.monika as string | undefined;
          const avatar = request_payload.avatar_url as string | undefined;
          if (monika) setCreatorName(monika);
          if (avatar) setCreatorAvatar(avatar);
        }
      } catch {
        // ignore and keep baseName/baseAvatar
      }
    };
    loadProfile();
    return () => {
      cancelled = true;
    };
  }, [duel_creator]);

  

  async function decideRoute(): Promise<string> {
    try {
      if ( difficulty != "P2P") {
        const { request_payload} = await readGameState(`duels/${duel_id}`);
        const is_completed = request_payload.is_completed
        if (is_completed) {
          return `/duels/${duel_id}`;
        }
      }
    } catch (err) {
    }

    const lowerCreator = typeof duel_creator === "string" ? duel_creator.toLowerCase() : "";
    const lowerOpponent = typeof duel_opponent === "string" ? duel_opponent.toLowerCase() : "";
    if ((activeAccount === lowerCreator || activeAccount === lowerOpponent) && creators_strategy != "Yet_to_select" && opponent_strategy != "Yet_to_select" && is_completed == false) {
      return `/duels/${duel_id}`;
    } else if ((activeAccount === lowerCreator || activeAccount === lowerOpponent) && (creators_strategy == "Yet_to_select" || opponent_strategy == "Yet_to_select")) {
      return `/strategy/${duel_id}`;
    } else if ((duel_opponent == null || duel_opponent === "") && activeAccount !== lowerCreator) {
      return `/joinduel/${duel_id}`;
    } else if (is_completed) {
      return `/duels/${duel_id}`;
    } 
    return `/duels/${duel_id}`
  }

  function convertTimestampToReadableTime(timestamp: number): string {
    const date = new Date(timestamp * 1000); // Convert to milliseconds
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    };
  
    return date.toLocaleDateString('en-US', options);
  }


  const handleDuelClicked = async () => {
    navigate(await decideRoute());
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && handleDuelClicked()}
      className="w-full max-w-5xl mx-auto my-3 sm:my-4"
      onClick={handleDuelClicked}
    >
      <div className="w-full relative overflow-hidden flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 rounded-xl border-2 border-gray-700/80 bg-myBlack/90 hover:border-myGreen/50 transition-all duration-200 cursor-pointer px-4 sm:px-6 py-4">
        {/* Decorative diagonal green accents */}
        <div className="pointer-events-none absolute -left-10 -top-1 h-4 w-64 bg-myGreen/80 skew-x-[-35deg]" />
        <div className="pointer-events-none absolute -right-16 -bottom-1 h-4 w-64 bg-myGreen/80 skew-x-[-35deg]" />

        {/* Content */}
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-6 w-full">
        {/* Creator: avatar + label + name */}
        <div className="flex items-center gap-4 sm:gap-5 flex-shrink-0">
          <img
            className="h-14 w-14 sm:h-16 sm:w-16 rounded-full object-cover border-2 border-gray-600 bg-gray-800"
            src={creatorAvatar || "/nebula-characters/techno-no.gif"}
            alt=""
          />
          <div className="flex flex-col min-w-0">
            <span className="font-belanosima text-xs uppercase tracking-wide text-gray-400">
              Creator
            </span>
            <span className="font-belanosima text-base sm:text-lg text-white truncate mt-0.5">
              {creatorName}
            </span>
          </div>
        </div>

        {/* Divider on larger screens */}
        <div className="hidden sm:block w-px h-10 mx-0 sm:mx-8 bg-gray-600 flex-shrink-0" />

        {/* Duel ID, Stake, Time */}
        <div className="flex flex-1 flex-wrap justify-between gap-x-4 gap-y-2 sm:gap-x-8">
          <div className="min-w-[90px]">
            <span className="block font-belanosima text-xs uppercase tracking-wide text-gray-400">
              Duel ID
            </span>
            <span className="block font-poppins text-sm sm:text-base text-white mt-0.5">
              {duel_id}
            </span>
          </div>
          <div className="min-w-[90px] text-center sm:text-left">
            <span className="block font-belanosima text-xs uppercase tracking-wide text-gray-400">
              Stake
            </span>
            <span className="block font-poppins text-sm sm:text-base text-myGreen mt-0.5">
              {stake_amount != null && stake_amount > 0 ? `${stake_amount} CTSI` : "0 CTSI"}
            </span>
          </div>
          <div className="min-w-[140px] sm:text-right flex-1">
            <span className="block font-belanosima text-xs uppercase tracking-wide text-gray-400">
              Created
            </span>
            <span className="block font-poppins text-xs sm:text-sm text-gray-300 mt-0.5 truncate">
              {convertTimestampToReadableTime(creation_time)}
            </span>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
};

export default DuelCard;
