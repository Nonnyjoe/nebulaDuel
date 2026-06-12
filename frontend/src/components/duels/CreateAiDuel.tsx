/* eslint-disable @typescript-eslint/no-explicit-any */
import { toast } from "sonner";
import { ImageWrap } from "../atom/ImageWrap";
import { Text } from "../atom/Text";
import { Button } from "../atom/Button";
import { useState } from "react";
import { HiOutlineArrowPath } from "react-icons/hi2";
// import readGameState from "../../utils/readState.js"
import signMessages from "../../utils/relayTransaction.tsx";
import WarriorPickCard from "../shared/WarriorPickCard";
import { useActiveAccount } from "thirdweb/react";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import charactersdata from "../../utils/Charactersdata";
import { useProfileContext } from "../contexts/ProfileContext.js";
import fetchNotices from "../../utils/readSubgraph.js";
import readGameState from "../../utils/readState.tsx";

// interface Duel {
//   duel_id: number;
//   duel_creator: string;
//   // duel_data: string;
// }

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
  img: string | undefined;
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

const CreateAiDuel = () => {
  const location = useLocation();
  const [selectedCharacters, setSelectedCharacters] = useState<
    CharacterDetails[]
  >([]);
  const [totalCharacterPrice, setTotalCharacterPrice] = useState<number>(0);
  // const [submitClicked, setSubmitClicked] = useState(false);
  const [selectedCharactersId, setSelectedCharactersId] = useState<number[]>(
    []
  );
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [characterDetails, setCharacterDetails] = useState<CharacterDetails[]>([]);
  const navigate = useNavigate();
  const activeAccount = useActiveAccount();
  const [acceptStake] = useState(false);
  const [stakeAmount] = useState<number>(0.0);
  const { setProfile } = useProfileContext();
  const [submiting, setSubmiting] = useState<boolean>(false);
  const [difficulty, setDifficulty] = useState<"easy" | "hard">("hard");
  const [initialised, setInitialised] = useState<boolean>(false);

  function shuffleArray(array: CharacterDetails[]) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  useEffect(() => {
    async function rigPage() {
      if (initialised) return;

      if (!activeAccount?.address) {
        toast.error("You are not connected to an account.", {
          position: "top-right",
        });
        navigate("/profile");
        return;
      }

      const wallet = activeAccount.address.toLowerCase();

      // First, confirm profile exists using has_profile
      console.log("Checking profile existence for wallet: ", wallet);
      const hasProfileResp = await readGameState(`has_profile/${wallet}`);
      if (!hasProfileResp.Status || hasProfileResp.request_payload !== true) {
        toast.error("You don't have a profile. Please create one.", {
          position: "top-right",
        });
        navigate("/profile");
        return;
      }

      // Then fetch full profile details via inspect
      const { Status, request_payload: profilePayload } = await readGameState(
        `profile/${wallet}`,
      );
      if (!Status || !profilePayload) {
        toast.error("Failed to fetch profile. Please try again.", {
          position: "top-right",
        });
        return;
      }

      setProfile(profilePayload);
      setProfileData(profilePayload);

      // Prefer inspect players_characters/<wallet> for this player
      const charsResp = await readGameState(`players_characters/${wallet}`);
      if (!charsResp.Status || !charsResp.request_payload) {
        // No characters yet; UI will show the fallback CTA
        return;
      }

      const payload = charsResp.request_payload;
      const rawCharacters: CharacterDetails[] = Array.isArray(payload)
        ? payload
        : typeof payload === "string"
          ? (() => {
              try {
                return JSON.parse(payload.startsWith("[") ? payload : `[${payload}]`);
              } catch {
                return [];
              }
            })()
          : [];
      console.log("AI duel - players characters from inspect:", rawCharacters);

      const enriched: CharacterDetails[] = rawCharacters.map((ch) => {
        const meta = charactersdata.find((c) => c.name === ch.name);
        return {
          ...ch,
          img: meta ? meta.img : undefined,
        };
      });

      setCharacterDetails(enriched);
    }
    rigPage().finally(() => setInitialised(true));
  }, [location, activeAccount?.address, navigate, setProfile, initialised]);

  // if (!profileData) {
  //     navigate('/profile');
  // }

  if (initialised && characterDetails.length === 0 && profileData) {
    return (
      <section className="w-full min-h-[50vh] flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full text-center">
          <p className="text-gray-400 font-poppins text-lg mb-6">
            You don't have any characters yet.
          </p>
          <Link
            to="/profile/purchasecharacter"
            className="inline-flex items-center justify-center bg-myGreen text-navBg font-bold font-poppins py-3 px-6 rounded-lg hover:bg-myGreen/90 transition-colors"
          >
            Create your first character
          </Link>
        </div>
      </section>
    );
  }

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

  //   function findHighestIdDuel(duels: Duel[], creator: string): Duel | null {
  //     // Filter duels by the given duel_creator
  //     const filteredDuels = duels.filter(
  //       (duel) => duel.duel_creator.toLowerCase() === creator.toLowerCase()
  //     );

  //     if (filteredDuels.length === 0) {
  //       return null; // Return null if no duels are found for the given creator
  //     }
  //     console.log("see them", filteredDuels);
  //     // Find the duel with the highest id
  //     let highestIdDuel = filteredDuels[0];

  //     for (let i = 0; i < filteredDuels.length; i++) {
  //       if (Number(filteredDuels[i].duel_id) > Number(highestIdDuel.duel_id)) {
  //         highestIdDuel = filteredDuels[i];
  //       }
  //     }

  //     return highestIdDuel;
  //   }

  const submitTx = async () => {
    if (selectedCharactersId.length < 3) {
      toast.error("You can have to select 3 characters.", {
        position: "top-right",
      });
      return;
    } else if (stakeAmount > (profileData?.cartesi_token_balance as number)) {
      toast.error("You don't have enough Cartesi Tokens.", {
        position: "top-right",
      });
      return;
    } else if (acceptStake && stakeAmount == 0) {
      toast.error("Please disable stake if you intend to stake 0 tokens", {
        position: "top-right",
      });
      return;
    }

    const dataObject = {
      func: "create_ai_duel",
      char_id1: selectedCharacters[0].id,
      char_id2: selectedCharacters[1].id,
      char_id3: selectedCharacters[2].id,
      difficulty_id: difficulty == "easy" ? 1 : 2,
    };

    console.log(dataObject, "dataObject");
    console.log("active account:", activeAccount?.address);

    setSubmiting(true);
    const txhash = await signMessages(dataObject);
    console.log("txHash", txhash);

    if (!txhash) {
      toast.error("Transaction failed or was rejected. Please try again.", {
        position: "top-right",
      });
      setSubmiting(false);
      return;
    }

    // signMessages waits for the node to process the input — the new duel is
    // already queryable.
    console.log("Fetching AI duels");
    let request_payload = await fetchNotices("ai_duels");
    console.log("Request payload: ", request_payload);

    if (!Array.isArray(request_payload)) {
      toast.error(
        "Unable to load your AI duels yet. Please wait a few seconds and try again.",
        { position: "top-right" },
      );
      setSubmiting(false);
      return;
    }

    request_payload = request_payload.filter(
      (tx: any) => tx.duel_creator === activeAccount?.address.toLowerCase(),
    );

    if (request_payload.length === 0) {
      toast.error(
        "Your duel was created but it isn’t visible yet. Please wait a moment and try again from the Duels page.",
        { position: "top-right" },
      );
      setSubmiting(false);
      return;
    }

    let highestTx = request_payload[0];
    for (let i = 0; i < request_payload.length; i++) {
      if (Number(request_payload[i].duel_id) > Number(highestTx.duel_id)) {
        highestTx = request_payload[i];
      }
    }
    navigate(`/strategy/${highestTx?.duel_id}`);
  };

  //   const submitTx2 = async () => {
  //     if (selectedCharactersId.length < 3) {
  //       toast.error("You can have to select 3 characters.", {
  //         position: "top-right",
  //       });
  //       return;
  //     } else if (stakeAmount > (profileData?.cartesi_token_balance as number)) {
  //       toast.error("You don't have enough Cartesi Tokens.", {
  //         position: "top-right",
  //       });
  //       return;
  //     } else if (acceptStake && stakeAmount == 0) {
  //       toast.error("Please disable stake if you intend to stake 0 tokens", {
  //         position: "top-right",
  //       });
  //       return;
  //     }

  //     const dataObject = {
  //       func: "create_ai_duel",
  //       char_id1: selectedCharacters[0].id,
  //       char_id2: selectedCharacters[1].id,
  //       char_id3: selectedCharacters[2].id,
  //       difficulty_id: difficulty == "easy" ? 1 : 2,
  //     };

  //     console.log(dataObject, "dataObject");
  //     console.log("active account:", activeAccount?.address);

  //     setSubmiting(true);
  //     const txhash = await signMessages(dataObject);

  //     if (txhash) {
  //       try {
  //         await delay(2000);
  //         // const {Status, request_payload} = await readGameState(`profile/${activeAccount?.address}`); // Call your function
  //         let request_payload = await fetchNotices("ai_duels");
  //         request_payload = request_payload.filter(
  //           (tx: any) => tx.caller == activeAccount?.address.toLowerCase()
  //         );
  //         console.log(request_payload);
  //         let Highest_tx;
  //         Highest_tx = request_payload[0];
  //         for (let i = 0; i < request_payload.length; i++) {
  //           if (request_payload[i].tx_id > Highest_tx.tx_id) {
  //             Highest_tx = request_payload[i];
  //           }
  //         }

  //         if (Highest_tx.method == "create_ai_duel") {
  //           toast.success("Transaction Successful.. Duel Created", {
  //             position: "top-right",
  //           });
  //           setTotalCharacterPrice(0);
  //           setSelectedCharacters([]);
  //           setSelectedCharactersId([]);
  //           const duels = await fetchNotices("ai_duels");
  //           console.log(duels);
  //           const userDuels = findHighestIdDuel(
  //             duels,
  //             activeAccount?.address as string
  //           );
  //           navigate(`/strategy/${userDuels?.duel_id}`);
  //         } else {
  //           toast.error("Transaction Failed.. Try again later.", {
  //             position: "top-right",
  //           });
  //           setSubmiting(false);
  //         }
  //       } catch (err) {
  //         console.log(err);
  //         toast.error("Error submitting transaction. Please try again later.", {
  //           position: "top-right",
  //         });
  //         setSubmiting(false);
  //       }
  //     }
  //     setSubmiting(false);
  //   };

  const toggleCharacterSelection = (character: CharacterDetails) => {
    const index = selectedCharacters.findIndex((c) => c.id === character.id);
    if (index < 0) {
      if (selectedCharacters.length < 3) {
        setSelectedCharacters([...selectedCharacters, character]);
        setSelectedCharactersId([...selectedCharactersId, character.id]);
        setTotalCharacterPrice(character.price + totalCharacterPrice);
      } else {
        toast.error("You can select only 3 characters.", {
          position: "top-right",
        });
      }
    } else {
      const updatedCharacters = [...selectedCharacters];
      const updatedCharactersId = [...selectedCharactersId];
      updatedCharacters.splice(index, 1);
      updatedCharactersId.splice(index, 1);

      setSelectedCharacters(updatedCharacters);
      setSelectedCharactersId(updatedCharactersId);
      setTotalCharacterPrice(totalCharacterPrice - character.price);
    }
  };

  const handleReset = () => {
    setSelectedCharacters([]);
    setTotalCharacterPrice(0);
    setSelectedCharactersId([]);
  };

  const handleSelectWarriors = (e: any) => {
    e.preventDefault();
    submitTx();
  };

  return (
    <section className="w-full min-h-screen">
      <main className="w-full max-w-[1500px] mx-auto py-8 sm:py-10 md:py-12 lg:py-16 px-4 sm:px-6 lg:px-8 flex flex-col items-center">
        <Text
          as="h1"
          className="reveal-up font-belanosima text-center uppercase text-2xl sm:text-3xl md:text-4xl text-white mb-2 sm:mb-4"
        >
          Choose your warriors
        </Text>
        <p className="text-gray-400 font-poppins text-sm sm:text-base text-center max-w-lg mb-8 sm:mb-10 md:mb-12">
          Select 3 characters for your AI duel. Tap a character to add or remove.
        </p>

        {/* Responsive: stack on small/medium, side-by-side on large */}
        <div className="w-full flex flex-col lg:flex-row lg:items-start gap-8 lg:gap-12 xl:gap-16">
          {/* Your Characters — full width when stacked, then ~58% on lg+ */}
          <div className="w-full lg:flex-[7] lg:min-w-0 flex flex-col">
            <div className="flex items-center gap-2 mb-4 sm:mb-6">
              <span className="h-0.5 w-8 sm:w-12 bg-myGreen rounded" />
              <Text
                as="h2"
                className="font-semibold font-belanosima text-lg sm:text-xl md:text-2xl text-white tracking-wide"
              >
                Your characters
              </Text>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4 md:gap-5 p-1.5 -m-1.5">
              {shuffleArray(characterDetails).map((item, index) => (
                <WarriorPickCard
                  key={`${item.id}-${index}`}
                  warrior={item}
                  selected={selectedCharactersId.includes(item.id)}
                  slot={selectedCharactersId.indexOf(item.id)}
                  onClick={() => toggleCharacterSelection(item)}
                />
              ))}
            </div>
          </div>

          {/* Selected + options + CTA — full width when stacked, then ~42% on lg+ */}
          <div className="w-full lg:flex-[5] lg:min-w-0 lg:sticky lg:top-8 flex flex-col gap-6 sm:gap-8">
            <div className="flex items-center gap-2">
              <span className="h-0.5 w-8 sm:w-12 bg-myGreen rounded" />
              <Text
                as="h2"
                className="font-semibold font-belanosima text-lg sm:text-xl md:text-2xl text-white tracking-wide"
              >
                Selected ({selectedCharacters.length}/3)
              </Text>
            </div>

            <div className="w-full relative rounded-xl border-2 border-gray-700/80 bg-myBlack/80 min-h-[200px] sm:min-h-[240px] p-4 sm:p-6">
              <div className="grid grid-cols-3 gap-2 sm:gap-4 h-full">
                {[0, 1, 2].map((slot) => {
                  const character = selectedCharacters[slot];
                  return (
                    <div
                      key={slot}
                      className="rounded-lg border border-dashed border-gray-600 bg-gray-900/50 min-h-[120px] sm:min-h-[140px] flex flex-col items-center justify-center p-2 overflow-hidden"
                    >
                      {character ? (
                        <>
                          <div className="aspect-square w-full max-w-[80px] flex-shrink-0">
                            <ImageWrap
                              image={character.img as string}
                              className="w-full h-full"
                              alt={character.name}
                              objectStatus="object-cover object-top"
                            />
                          </div>
                          <Text as="span" className="font-belanosima text-white text-xs sm:text-sm truncate w-full text-center">
                            {character.name}
                          </Text>
                        </>
                      ) : (
                        <span className="text-gray-500 text-xs font-poppins">Slot {slot + 1}</span>
                      )}
                    </div>
                  );
                })}
              </div>
              {selectedCharacters.length > 0 && (
                <Button
                  type="button"
                  aria-label="Clear selection"
                  className="absolute top-2 right-2 sm:top-3 sm:right-3 bg-gray-700 hover:bg-gray-600 text-white p-2 rounded-full transition-colors z-10"
                  onClick={handleReset}
                >
                  <HiOutlineArrowPath className="w-5 h-5" />
                </Button>
              )}
            </div>

            <div className="rounded-xl border border-gray-700/60 bg-myBlack/60 p-4 sm:p-5 space-y-4">
              <p className="text-gray-400 font-poppins text-sm sm:text-base text-center">
                Available balance: <span className="text-white font-medium">{profileData?.cartesi_token_balance ?? 0} CTSI</span>
              </p>
              <div>
                <label className="block text-sm font-poppins font-medium text-gray-400 mb-3">
                  Difficulty
                </label>
                <div className="flex gap-3">
                  <label className="flex-1 cursor-pointer">
                    <input
                      type="radio"
                      name="difficulty"
                      value="easy"
                      checked={difficulty === "easy"}
                      onChange={(e) => setDifficulty(e.target.value as "easy")}
                      className="sr-only peer"
                    />
                    <span className="block rounded-lg border-2 border-gray-600 bg-gray-800/50 py-2.5 text-center text-sm font-poppins text-gray-400 transition-all peer-checked:border-myGreen peer-checked:bg-myGreen/10 peer-checked:text-myGreen">
                      Easy
                    </span>
                  </label>
                  <label className="flex-1 cursor-pointer">
                    <input
                      type="radio"
                      name="difficulty"
                      value="hard"
                      checked={difficulty === "hard"}
                      onChange={(e) => setDifficulty(e.target.value as "hard")}
                      className="sr-only peer"
                    />
                    <span className="block rounded-lg border-2 border-gray-600 bg-gray-800/50 py-2.5 text-center text-sm font-poppins text-gray-400 transition-all peer-checked:border-myGreen peer-checked:bg-myGreen/10 peer-checked:text-myGreen">
                      Hard
                    </span>
                  </label>
                </div>
              </div>
            </div>

            <Button
              type="button"
              className="w-full text-navBg uppercase font-bold font-poppins text-sm sm:text-base tracking-wide py-3.5 sm:py-4 rounded-xl bg-myGreen hover:bg-myYellow transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              onClick={handleSelectWarriors}
              disabled={submiting}
            >
              {submiting ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-spin rounded-full h-5 w-5 border-2 border-navBg border-t-transparent" />
                  Creating…
                </span>
              ) : (
                "Create duel"
              )}
            </Button>
          </div>
        </div>
      </main>
    </section>
  );
};

export default CreateAiDuel;
