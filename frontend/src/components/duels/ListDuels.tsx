import "animate.css/animate.min.css";
import { useState, useEffect } from "react";
// import readGameState from "../../utils/readState.js";
// import DuelCard from "./DuelCard1.js";
import DuelCard from "./DuelCard.js";
import PageHero from "../shared/PageHero";
import { useNavigate } from 'react-router-dom';
// import { useActiveAccount } from "thirdweb/react";
import fetchNotices from "../../utils/readSubgraph.js";

interface Duel {
  id: number;
  title: string;
  description: string;
}

interface Duel {
  duel_id: number;
  duel_creator: string;
  description: string;
  characters: string[];
  winner: string;
  competitors: string[];
  logs: string[];
  creation_time: number;
  stake_amount: number;
  duel_opponent: string;
  creators_strategy: string;
  opponents_strategy: string;
  duel_winner: string;
  is_completed: boolean;
  difficulty: string;
}

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


const ListDuels = () => {
  const [activeTab, setActiveTab] = useState<"open" | "all" | "ai">("open");
  const [duels, setDuels] = useState<Duel[]>([]);
  // const [activeAccordion, setActiveAccordion] = useState<number | null>(null);
  const [aiDuels, setAIDuels] = useState<Duel[]>([]);
  const [allDuels, setAllDuels] = useState<Duel[]>([]);
  const [availableDuels, setAvailableDuels] = useState<Duel[]>([]);
  const [allPlayers, setAllPlayers] = useState<ProfileData[]>([]);
  // const activeAccount = useActiveAccount();
  const navigate = useNavigate();


  // console.log("Available Duels", activeDuels);
  // console.log("All Duels", allDuels);

  const fetchAllPlayers = async () => {
    try {
      const request_payload = await fetchNotices("all_profiles");
      const list = Array.isArray(request_payload)
        ? request_payload
        : request_payload != null && typeof request_payload === "object"
          ? [request_payload]
          : [];
      setAllPlayers(list);
    } catch (error) {
      setAllPlayers([]);
    }
  };

  const routeToCreateDuel = async () => {
    navigate(`/selectWarriors`)
  }

    async function getDuels() {
      await fetchAllPlayers();
      try {
          const resDuels = await fetchNotices("all_duels");

          // Treat only non-AI duels (difficulty === 'P2P') as P2P duels
          const p2pDuels: Duel[] = (resDuels || []).filter((duel: Duel) =>
            duel.difficulty &&
            typeof duel.difficulty === "string" &&
            duel.difficulty.toLowerCase() === "p2p"
          );

          const allAvailableP2P = p2pDuels.filter(
            (duel: Duel) =>
              duel.is_completed === false &&
              (duel.duel_opponent == null || duel.duel_opponent === "")
          );

          setAvailableDuels(allAvailableP2P);
          setAllDuels(p2pDuels);

          const aiDuelsRes = await fetchNotices("ai_duels");
          setAIDuels(aiDuelsRes || []);
          setDuels(allAvailableP2P);
      } catch (e: any) {
      }
    }

  useEffect(() => {
    getDuels();
    // Live lobby: refresh every 30s so new duels/joins appear without a reload.
    const poll = setInterval(getDuels, 30_000);
    return () => clearInterval(poll);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (activeTab === "open") {
      setDuels(availableDuels);
    } else if (activeTab === "ai") {
      setDuels(aiDuels);
    } else {
      // P2P duels (allDuels holds only P2P after filtering in getDuels)
      setDuels(allDuels);
    }
  }, [activeTab, availableDuels, aiDuels, allDuels]);

  // console.log("Fetching open duels", duels);

  // const toggleAccordion = (id: number) => {
  //   setActiveAccordion(activeAccordion === id ? null : id);
  // };

  return (
    <div className="main--area overflow-x-hidden">
      <PageHero
        kicker="The proving grounds"
        title="All"
        accent="duels"
        subtitle="Open challenges from across the Nebula — join a P2P duel, spectate finished battles, or strike out against the AI."
        crumbs={[{ label: "Home", path: "/" }, { label: "Duels" }]}
        compact
      />

      {/* See Duel List */}
      <div className=" float-right border mr-20 mt-10 mb-20 py-3 px-10 rounded-md border-[#45f882] text-lg shadow-md shadow-green-300 hover:bg-[#45f882] hover:text-black hover:cursor-pointer" onClick={routeToCreateDuel}>
            <p className=" font-belanosima"> + Create Duel</p>
      </div>

      <section className="breadcrumb-area-02 w-full pb-[120px] pt-10 bg-center bg-cover mt-10">
        <div className="p-4 sm:p-8 max-w-5xl mx-auto">
          <div className="flex justify-center mb-4">
          <button
              onClick={() => setActiveTab("open")}
              className={`px-10 py-2 mx-2 rounded-xl transition duration-500 ease-in-out transform hover:-translate-y-1 text-xl font-belanosima hover:scale-110 ${
                activeTab === "open" ? "bg-[#45f882] text-black" : "bg-gray-700"
              }`}
            >
              Available Duels
            </button>
            <button
              onClick={() => setActiveTab("all")}
              className={`px-10 py-2 mx-2 rounded-xl transition duration-500 ease-in-out transform hover:-translate-y-1 text-xl font-belanosima hover:scale-110 ${
                activeTab === "all" ? "bg-[#45f882] text-black" : "bg-gray-700"
              }`}
            >
              P2P Duels
            </button>
            <button
              onClick={() => setActiveTab("ai")}
              className={`px-10 py-2 mx-2 rounded-xl transition duration-500 ease-in-out transform hover:-translate-y-1 text-xl font-belanosima hover:scale-110 ${
                activeTab === "ai" ? "bg-[#45f882] text-black" : "bg-gray-700"
              }`}
            >
              AI Duels
            </button>
          </div>
          <div className="mt-4 sm:mt-14 space-y-3 sm:space-y-4">
            {duels?.length > 0 ? (
              duels.map((duel) => (
                <DuelCard
                  key={duel.duel_id ?? `${duel.duel_creator}-${duel.creation_time}`}
                  duel_id={duel.duel_id}
                  duel_creator={duel.duel_creator}
                  creation_time={duel.creation_time}
                  stake_amount={duel.stake_amount}
                  allPlayers={allPlayers}
                  duel_opponent={duel.duel_opponent}
                  creators_strategy={duel.creators_strategy}
                  opponent_strategy={duel.opponents_strategy}
                  is_completed={duel.is_completed}
                  difficulty={duel.difficulty}
                />
              ))
            ) : (
              <div className=" mt-14 text-center text-white font-belanosima text-xl h-60 py-28">
                Awaiting Duel Data......
              </div>
            )}
          </div>
        </div>
      </section>
      {/* <DuelComponent /> */}
    </div>
  );
};

export default ListDuels;
