/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { Button } from "../atom/Button";
import { ImageWrap } from "../atom/ImageWrap";
import { Text } from "../atom/Text";
// import { data } from "../profile/PurchaseCharacter"
import { toast } from "sonner";
import { HiOutlineArrowPath } from "react-icons/hi2";
import { useParams } from "react-router-dom";
// import readGameState from "../../utils/readState.js"
import signMessages from "../../utils/relayTransaction.tsx";
import { useActiveAccount } from "thirdweb/react";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import charactersdata from "../../utils/Charactersdata";
// import { useProfileContext } from "../contexts/ProfileContext.js";
import fetchNotices from "../../utils/readSubgraph.js";
import StatBars from "../shared/StatBars";
import { ELEMENT_META, powerToElement, STRATEGIES } from "../../utils/campaign";
// import readGameState from "../../utils/readState.tsx";

interface StrategyInterface {
  id: number;
  name: string;
  code: string;
}

interface CharacterDetails {
  id: number;
  name: string;
  health: number;
  strength: number;
  attack: number;
  speed: number;
  owner: string;
  price: number;
  super_power: string;
  total_battles: number;
  total_losses: number;
  total_wins: number;
  img: string;
}

// Define the ProfileData type
// interface ProfileData {
//     monika: string;
//     wallet_address: string;
//     avatar_url: string;
//     characters: string;
//     id: number;
//     cartesi_token_balance: number;
//     // Add other properties if needed
// }

// interface warriorsId {
//     char_id: number;
// }

const ChooseStrategy = () => {
  const { duelId } = useParams();
  const [selectedStrategy, setSelectedStrategy] = useState<
    StrategyInterface | undefined
  >();
  // const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [creatorCharacterDetails, setCreatorCharacterDetails] = useState<
    CharacterDetails[]
  >([]);
  const [opponentCharacterDetails, setOpponetCharacterDetails] = useState<
    CharacterDetails[]
  >([]);
  const [duelCreator, setDuelCreator] = useState<string>("");
  const [duelJoiner, setDuelJoiner] = useState<string>(" ");
  const [duelType, setDuelType] = useState<string>(" ");
  // const [refresher, setRefresher] = useState<number>();
  const navigate = useNavigate();
  const location = useLocation();
  const activeAccount = useActiveAccount();
  // const {profile, setProfile} = useProfileContext();
  const [submiting, setSubmiting] = useState<boolean>(false);

  function delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  useEffect(() => {
    const fetchData = async () => {
      let dPayload = await fetchNotices("all_duels");
      dPayload = dPayload.filter(
        (Payload: any) => Number(Payload.duel_id) == Number(duelId)
      );
      if (dPayload.length == 0) {
        let ai_duels = await fetchNotices("ai_duels");
        ai_duels = ai_duels.filter(
          (Payload: any) => Number(Payload.duel_id) == Number(duelId)
        );
        if (ai_duels.length != 0) {
          dPayload = ai_duels[0];
        }
      } else {
        dPayload = dPayload[0];
      }
      if (dPayload != undefined && dPayload != null) {
        setDuelCreator(dPayload.duel_creator);
        setDuelJoiner(dPayload.duel_opponent);
        setDuelType(dPayload.difficulty);
        if (activeAccount?.address?.toLowerCase() == dPayload.duel_creator) {
        } else if (
          activeAccount?.address?.toLowerCase() == dPayload.duel_opponent
        ) {
        } else {
          if (dPayload.is_complete == true) {
            navigate(`/duels/${duelId}`);
          } else {
            // navigate(`/joinduel/${duelId}`);
          }
        }

        const request_payload = await fetchNotices("all_characters");
        const cPayload = request_payload.filter(
          (character: CharacterDetails) =>
            character.id == JSON.parse(dPayload.creator_warriors)[0].char_id ||
            character.id == JSON.parse(dPayload.creator_warriors)[1].char_id ||
            character.id == JSON.parse(dPayload.creator_warriors)[2].char_id
        );

        // const {Status: cStatus, request_payload: cPayload} = await readGameState(`get_duel_characters/${duelId}/${dPayload.duel_creator}`); // Call your function
        // console.log(cPayload, "cPayload");

        let placeholder = [];

        for (let i = 0; i < cPayload.length; i++) {
          const characterData = charactersdata.find(
            (character) => character.name === cPayload[i].name
          );
          const details = {
            ...cPayload[i],
            img: characterData ? characterData.img : undefined,
          };
          placeholder.push(details);
        }
        setCreatorCharacterDetails(placeholder);
        placeholder = [];

        // const request_payload = await fetchNotices("all_characters");
        // console.log("PPayload...... ", JSON.parse(dPayload.opponent_warriors));
        const pPayload = request_payload.filter(
          (character: CharacterDetails) =>
            character.id == JSON.parse(dPayload.opponent_warriors)[0].char_id ||
            character.id == JSON.parse(dPayload.opponent_warriors)[1].char_id ||
            character.id == JSON.parse(dPayload.opponent_warriors)[2].char_id
        );

        // const {Status: pStatus, request_payload: pPayload} = await readGameState(`get_duel_characters/${duelId}/${dPayload.duel_opponent}`); // Call your function

        for (let i = 0; i < pPayload.length; i++) {
          const characterData = charactersdata.find(
            (character) => character.name === pPayload[i].name
          );
          const details = {
            ...pPayload[i],
            img: characterData ? characterData.img : undefined,
          };
          placeholder.push(details);
        }
        setOpponetCharacterDetails(placeholder); //
        placeholder = [];
      }
    };

    fetchData(); // Call the function on component mount
  }, [location]);

  function getYourWarriors(): CharacterDetails[] {
    if (activeAccount?.address.toLowerCase() == duelCreator.toLowerCase()) {
      return creatorCharacterDetails;
    } else return opponentCharacterDetails;
  }

  function getOtherWarriors(): CharacterDetails[] {
    if (activeAccount?.address.toLowerCase() == duelCreator.toLowerCase()) {
      return opponentCharacterDetails;
    } else return creatorCharacterDetails;
  }

  const toggleStrategySelection = (strategy: any) => {
    setSelectedStrategy(strategy);
  };

  const handleReset = () => {
    setSelectedStrategy(undefined);
  };

  const handleStrategySelection = async (e: any) => {
    e.preventDefault();
  
    if (opponentCharacterDetails.length !== 3) {
      toast.error(
        "Please wait for opponent to join before starting duel... Refresh to confirm a new participant.",
        { position: "top-right" },
      );
      setSubmiting(false);
      return;
    }
  
    if (!selectedStrategy) {
      toast.error("Please select a strategy before starting the duel.", {
        position: "top-right",
      });
      setSubmiting(false);
      return;
    }
  
    const dataObject1 = {
      func: "set_strategy",
      strategy_id: selectedStrategy.id,
      duel_id: Number(duelId as string),
    };
    const dataObject2 = {
      func: "select_ai_battle_strategy",
      strategy_id: Number(selectedStrategy.id),
      duel_id: Number(duelId),
    };
  
  
    setSubmiting(true);
  
    let txhash;
    try {
      if (duelType.toLowerCase() !== "p2p") {
        txhash = await signMessages(dataObject2);
      } else {
        txhash = await signMessages(dataObject1);
      }
    } catch (err: any) {
      toast.error("Error in transaction: " + err.message, {
        position: "top-right",
      });
      setSubmiting(false);
      return;
    }
  
    if (!txhash) {
      toast.error("Failed to set strategy. Please try again later.", {
        position: "top-right",
      });
      setSubmiting(false);
      return;
    }
  
    // 1) Transaction submitted
    toast.success("Transaction submitted successfully.", {
      position: "top-right",
    });
  
    // 2) Start confirmation toast and poll backend for duel status
    toast("Confirming duel status...", { position: "top-right" });
  
    const maxAttempts = 6;
    const pollIntervalMs = 3000;
    const lowerActive = activeAccount?.address.toLowerCase();
    const creatorAddr = duelCreator?.toLowerCase();
    const joinerAddr = duelJoiner?.toLowerCase();
  
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      await delay(pollIntervalMs);
  
      let duelsPayload: any = await fetchNotices("all_duels");
      if (!Array.isArray(duelsPayload)) {
        duelsPayload = [];
      }
  
      const duel = duelsPayload.find(
        (d: any) => Number(d.duel_id) === Number(duelId),
      );
  
      if (!duel) {
        continue;
      }
  
      const creatorReady =
        lowerActive === creatorAddr &&
        duel.creators_strategy &&
        duel.creators_strategy !== "Yet_to_select";
      const opponentReady =
        lowerActive === joinerAddr &&
        duel.opponents_strategy &&
        duel.opponents_strategy !== "Yet_to_select";
  
      if (creatorReady || opponentReady || duel.is_complete) {
        toast.success("Strategy confirmed. Starting duel...", {
          position: "top-right",
        });
        setSubmiting(false);
        navigate(`/duels/${duelId}`);
        return;
      }
    }
  
    // 3) If we get here, we never saw the updated duel state
    toast.error(
      "Unable to confirm duel status yet. Please check the Duels page in a few moments.",
      { position: "top-right" },
    );
    setSubmiting(false);
  };

  // function getArrayLength(jsonString: string): number | null {
  //     try {
  //         // Parse the JSON string to an array of objects
  //         const array: { char_id: number }[] = JSON.parse(jsonString);

  //         // Check if the parsed result is indeed an array
  //         if (Array.isArray(array)) {
  //             // Return the length of the array
  //             return array.length;
  //         } else {
  //             throw new Error('Parsed result is not an array');
  //         }
  //     } catch (error: any) {
  //         console.error('Error parsing JSON string:', error.message);
  //         return null;
  //     }
  // }

  return (
    <main className="w-full min-h-screen flex flex-col items-center py-8 sm:py-10 md:py-12 lg:py-16 px-4 sm:px-6 lg:px-8">
      <Text
        as="h1"
        className="reveal-up font-belanosima text-center uppercase text-2xl sm:text-3xl md:text-4xl text-white mb-2 sm:mb-4"
      >
        Choose your strategy
      </Text>
      <p className="text-gray-400 font-poppins text-sm sm:text-base text-center max-w-xl mb-8 sm:mb-10 md:mb-12">
        Review both teams and pick how your warriors should attack. Your choice
        will decide the flow of the battle.
      </p>

      <section className="w-full max-w-[1368px] flex flex-col lg:flex-row lg:items-start gap-8 lg:gap-12 xl:gap-16">
        {/* Your warriors column */}
        <div className="w-full lg:flex-[7] lg:min-w-0 flex flex-col">
          <div className="flex items-center gap-2 mb-4 sm:mb-6">
            <span className="h-0.5 w-8 sm:w-12 bg-myGreen rounded" />
            <Text
              as="h2"
              className="font-belanosima font-semibold text-lg sm:text-xl md:text-2xl text-white"
            >
              Your warriors
            </Text>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 md:gap-5">
            {getYourWarriors().map((item, index) => (
              <div
                key={index}
                className="w-full rounded-xl border-2 border-gray-700/80 bg-myBlack/80 backdrop-blur-sm flex flex-col overflow-hidden p-3 sm:p-4"
              >
                <div className="card-media rounded-lg">
                  <ImageWrap
                    image={item.img}
                    className="w-full h-full"
                    alt={item.name}
                    objectStatus="object-cover object-top"
                  />
                </div>
                <div className="mt-3 flex flex-col gap-2">
                  <div className="flex items-center justify-between gap-2">
                    <Text
                      as="span"
                      className="font-belanosima text-white text-sm sm:text-base truncate"
                    >
                      {item.name}
                    </Text>
                    {(() => {
                      const element = powerToElement(item.super_power);
                      const meta = ELEMENT_META[element];
                      return (
                        <span className={`shrink-0 text-[10px] rounded-full px-2 py-0.5 ${meta.bg} ${meta.color}`}>
                          {meta.emoji} {element}
                        </span>
                      );
                    })()}
                  </div>
                  <StatBars
                    size="sm"
                    stats={{
                      health: item.health,
                      strength: item.strength,
                      attack: item.attack,
                      speed: item.speed,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Opponent warriors column */}
        <div className="w-full lg:flex-[5] lg:min-w-0 flex flex-col">
          <div className="flex items-center gap-2 mb-4 sm:mb-6">
            <span className="h-0.5 w-8 sm:w-12 bg-myGreen rounded" />
            <Text
              as="h2"
              className="font-belanosima font-semibold text-lg sm:text-xl md:text-2xl text-white"
            >
              Opponent warriors
            </Text>
          </div>

          {getOtherWarriors().length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 md:gap-5">
              {getOtherWarriors().map((item, index) => (
                <div
                  key={index}
                  className="w-full rounded-xl border-2 border-gray-700/80 bg-myBlack/80 backdrop-blur-sm flex flex-col overflow-hidden p-3 sm:p-4"
                >
                  <div className="card-media rounded-lg">
                    <ImageWrap
                      image={item.img}
                      className="w-full h-full"
                      alt={item.name}
                      objectStatus="object-cover object-top"
                    />
                  </div>
                  <div className="mt-3 flex flex-col gap-2">
                    <div className="flex items-center justify-between gap-2">
                      <Text
                        as="span"
                        className="font-belanosima text-white text-sm sm:text-base truncate"
                      >
                        {item.name}
                      </Text>
                      {(() => {
                        const element = powerToElement(item.super_power);
                        const meta = ELEMENT_META[element];
                        return (
                          <span className={`shrink-0 text-[10px] rounded-full px-2 py-0.5 ${meta.bg} ${meta.color}`}>
                            {meta.emoji} {element}
                          </span>
                        );
                      })()}
                    </div>
                    <StatBars
                      size="sm"
                      stats={{
                        health: item.health,
                        strength: item.strength,
                        attack: item.attack,
                        speed: item.speed,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-6 sm:mt-8 w-full min-h-[200px] sm:min-h-[240px] rounded-xl border-2 border-dashed border-gray-700 bg-myBlack/80 flex flex-col items-center justify-center px-4">
              <Text
                as="h5"
                className="font-belanosima text-center text-sm sm:text-base text-gray-300 mb-4"
              >
                Waiting for opponent to join…
              </Text>
              <div className="animate-spin rounded-full h-14 w-14 sm:h-16 sm:w-16 border-2 border-myGreen border-t-transparent" />
            </div>
          )}
        </div>
      </section>

      {/* Strategy selection section */}
      <section className="w-full max-w-[1368px] mt-12 sm:mt-14 md:mt-16 flex flex-col items-center gap-5 sm:gap-6">
        <Text
          as="h2"
          className="font-belanosima text-center text-xl sm:text-2xl md:text-3xl text-white"
        >
          Select attack strategy
        </Text>
        <p className="text-gray-400 font-poppins text-xs sm:text-sm text-center max-w-lg">
          Choose how your warriors will prioritize their targets. You can change
          this before the duel begins.
        </p>

        <div className="w-full grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          {strategy.map((item) => {
            const selected = selectedStrategy?.id === item.id;
            return (
              <button
                type="button"
                key={item.id}
                onClick={() => toggleStrategySelection(item)}
                className={`w-full rounded-xl border-2 px-3 py-3 sm:px-4 sm:py-4 bg-myBlack/80 text-left transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-myGreen focus-visible:ring-offset-2 focus-visible:ring-offset-bodyBg ${
                  selected
                    ? "border-myGreen bg-myGreen/10 shadow-[0_0_12px_rgba(69,248,130,0.35)]"
                    : "border-gray-700/80 hover:border-gray-500 hover:bg-gray-900/60"
                }`}
              >
                <Text
                  as="span"
                  className={`font-belanosima text-sm sm:text-base ${selected ? "text-myGreen" : "text-white"}`}
                >
                  {STRATEGIES.find((s) => s.id === item.id)?.emoji ?? "⚔️"}{" "}
                  {STRATEGIES.find((s) => s.id === item.id)?.name ?? item.name}
                </Text>
                <p className="text-[10px] text-gray-400 font-poppins mt-1 leading-snug">
                  {STRATEGIES.find((s) => s.id === item.id)?.description ?? ""}
                </p>
              </button>
            );
          })}
        </div>

        <div className="flex gap-3 items-center mt-2 sm:mt-4">
          <Button
            type="button"
            className="w-full sm:w-auto text-navBg uppercase font-bold font-poppins text-sm sm:text-base tracking-wide py-3.5 sm:py-4 px-8 rounded-xl bg-myGreen hover:bg-myYellow transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            onClick={handleStrategySelection}
            disabled={submiting}
          >
            {submiting ? (
              <span className="flex items-center justify-center gap-2">
                <span className="animate-spin rounded-full h-5 w-5 border-2 border-navBg border-t-transparent" />
                Setting…
              </span>
            ) : (
              "Set strategy"
            )}
          </Button>
          {selectedStrategy && (
            <Button
              type="button"
              className="bg-gray-700 hover:bg-gray-600 text-white p-2 rounded-full z-10 font-bold text-lg"
              onClick={handleReset}
            >
              <HiOutlineArrowPath className="w-5 h-5" />
            </Button>
          )}
        </div>
      </section>
    </main>
  );
};

export default ChooseStrategy;

type StrategyType = {
  id: number;
  name: string;
  code: string;
};

const strategy: StrategyType[] = [
  {
    id: 1,
    name: "MaxHealth To Lowest Health",
    code: "M2LH",
  },
  {
    id: 2,
    name: "LowestHealth To MaxHealth",
    code: "L2MH",
  },
  {
    id: 3,
    name: "MaxStrength To LowestStrength",
    code: "M2LS",
  },
  {
    id: 4,
    name: "LowestStrength To MaxStrength",
    code: "l2MS",
  },
  {
    id: 5,
    name: "MaxAttack To LowestAttack",
    code: "M2LA",
  },
  {
    id: 6,
    name: "LowestSpeed To MaxSpeed",
    code: "L2MSp",
  },
];
