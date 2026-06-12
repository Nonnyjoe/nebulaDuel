/* eslint-disable @typescript-eslint/no-explicit-any */
import { toast } from "sonner";
import { ImageWrap } from "../atom/ImageWrap";
import { Text } from "../atom/Text";
import Img1 from "../../assets/img/Rhyno.png";
import Img2 from "../../assets/img/Dragon.png";
import Img3 from "../../assets/img/Godzilla.png";
import Img4 from "../../assets/img/Hound.png";
import Img5 from "../../assets/img/KomodoDragon.png";
import Img6 from "../../assets/img/IceBeever.png";
import Img7 from "../../assets/img/Fox.png";
import Img8 from "../../assets/img/komodo.png";
import { Button } from "../atom/Button";
import { useState } from "react";
import { HiOutlineArrowPath } from "react-icons/hi2";
import charactersdata from '../../utils/Charactersdata';
import { useActiveAccount } from "thirdweb/react";
// import readGameState from "../../utils/readState.js"
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import signMessages from "../../utils/relayTransaction.tsx"
import { useProfileContext } from "../contexts/ProfileContext.js";
import readGameState from "../../utils/readState.tsx";
import StatBars from "../shared/StatBars";
import { ELEMENT_META, powerToElement } from "../../utils/campaign";

interface Character {
  id: number;
  name: string;
  health: number;
  strength: number;
  attack: number;
  speed: number;
  super_power: string;
  price: number;
  img: string;
}

// Define the ProfileData type
interface ProfileData {
  monika: string;
  wallet_address: string;
  avatar_url: string;
  characters: string;
  id: number;
  points: number;
  // Add other properties if needed
}





const PurchaseCharacter = () => {
  const [selectedCharacters, setSelectedCharacters] = useState<Character[]>([]);
  const [totalCharacterPrice, setTotalCharacterPrice] = useState<number>(0);
  // const [submitClicked, setSubmitClicked] = useState(false);
  const [selectedCharactersId, setSelectedCharactersId] = useState<number[]>([]);
  const navigate = useNavigate();
  const activeAccount = useActiveAccount()?.address;
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const characters = charactersdata;
  const { setProfile } = useProfileContext();
  const [submiting, setSubmiting] = useState<boolean>(false);
  const [initialised, setInitialised] = useState<boolean>(false);



  useEffect(() => {
    async function SetUp() {
      if (initialised) return;
      if (!activeAccount) {
        navigate("/profile");
        return;
      }

      const wallet = activeAccount.toLowerCase();

      // First, check via inspect if the player has a profile
      const hasProfileResp = await readGameState(`has_profile/${wallet}`);
      if (!hasProfileResp.Status || hasProfileResp.request_payload !== true) {
        navigate("/profile");
        return;
      }

      // Then fetch full profile details via inspect
      const { Status, request_payload } = await readGameState(
        `profile/${wallet}`,
      );

      if (!Status || !request_payload) {
        // Profile should exist, but if this fails, stay on page and show nothing rather than looping
        return;
      }

      setProfile(request_payload);
      setProfileData(request_payload);
      console.log(
        "characters ==",
        getArrayLength(request_payload.characters as string),
      );
    }

    SetUp().finally(() => setInitialised(true));
  }, [activeAccount, navigate, setProfile, initialised]);

  function getArrayLength(jsonString: string): number | null {
    try {
        // Parse the JSON string to an array of objects
        const array: { char_id: number }[] = JSON.parse(jsonString);
        
        // Check if the parsed result is indeed an array
        if (Array.isArray(array)) {
            // Return the length of the array
            return array.length;
        } else {
            throw new Error('Parsed result is not an array');
        }
    } catch (error: any) {
        console.error('Error parsing JSON string:', error.message);
        return null;
    }
}

  const toggleCharacterSelection = (character: Character) => {
    const index = selectedCharacters.findIndex((c) => c.id === character.id);
    if (index < 0) {
      if (selectedCharacters.length < 3) {
        //check that total price is not greater than 1050
        // if (totalCharacterPrice + character.price > 1050) {
        //   toast.error("You've exceeded max points: 1050 points", {
        //     position: "top-right",
        //   });
        //   return;
        // }
        setSelectedCharacters([...selectedCharacters, character]);
        setSelectedCharactersId([...selectedCharactersId, character.id]);
        setTotalCharacterPrice(character.price + totalCharacterPrice);
        console.log(selectedCharactersId)

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

  const handlePurchaseCharacter = async (e: any) => {
    e.preventDefault();

    if (selectedCharactersId.length < 3) {
      toast.error("You have to select 3 characters.", {
        position: "top-right",
      });
      return;
    }

    const availablePoints = (profileData?.points as number) ?? 0;
    if (totalCharacterPrice > availablePoints) {
      toast.error("You don't have enough points to purchase this team.", {
        position: "top-right",
      });
      return;
    }

    console.log("selected id's are: ", selectedCharactersId);
    setSubmiting(true);
    const dataObject = {
      func: "purchase_team",
      char_id1: selectedCharactersId[0] - 1,
      char_id2: selectedCharactersId[1] - 1,
      char_id3: selectedCharactersId[2] - 1,
    };
    console.log("data Obj", dataObject);
    const txhash = await signMessages(dataObject);

    if (txhash) {
      await delay(2000);

      const { Status, request_payload } = await readGameState(
        `profile/${activeAccount}`,
      );
      if (Status && JSON.parse(request_payload.characters).length > 0) {
        setSelectedCharacters([]);
        setSelectedCharactersId([]);
        setTotalCharacterPrice(0);
        setProfileData(request_payload);
        setProfile(request_payload);

        toast.success("Character(s) purchased successfully!", {
          position: "top-right",
        });
        navigate("/duels");
      } else {
        toast.error("Something went wrong, please submit again!", {
          position: "top-right",
        });
      }
    } else {
      toast.error("Something went wrong, please submit again!", {
        position: "top-right",
      });
    }

    setSubmiting(false);
  };

  //nebuladuel

  // function shuffleArray(array: typeof charactersdata) {
  //   for (let i = array.length - 1; i > 0; i--) {
  //     const j = Math.floor(Math.random() * (i + 1));
  //     [array[i], array[j]] = [array[j], array[i]];
  //   }
  //   return array;
  // }

  function delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  return (
    <section className="w-full min-h-screen">
      <main className="w-full max-w-[1500px] mx-auto py-8 sm:py-10 md:py-12 lg:py-16 px-4 sm:px-6 lg:px-8 flex flex-col items-center">
        <Text
          as="h1"
          className="reveal-up font-belanosima text-center uppercase text-2xl sm:text-3xl md:text-4xl text-white mb-2 sm:mb-4"
        >
          Select characters to purchase
        </Text>
        <p className="text-gray-400 font-poppins text-sm sm:text-base text-center max-w-lg mb-8 sm:mb-10 md:mb-12">
          Choose 3 characters for your team. Max 1050 points total. Tap to add or remove.
        </p>

        <div className="w-full flex flex-col lg:flex-row lg:items-start gap-8 lg:gap-12 xl:gap-16">
          {/* All Characters */}
          <div className="w-full lg:flex-[7] lg:min-w-0 flex flex-col">
            <div className="flex items-center gap-2 mb-4 sm:mb-6">
              <span className="h-0.5 w-8 sm:w-12 bg-myGreen rounded" />
              <Text
                as="h2"
                className="font-semibold font-belanosima text-lg sm:text-xl md:text-2xl text-white tracking-wide"
              >
                All characters
              </Text>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4 md:gap-5">
              {characters.map((item, index) => {
                const selected = selectedCharactersId.includes(item.id);
                return (
                  <button
                    type="button"
                    key={`${item.id}-${index}`}
                    onClick={() => toggleCharacterSelection(item)}
                    className={`w-full text-left rounded-xl border-2 bg-myBlack/80 backdrop-blur-sm flex flex-col overflow-hidden transition-all duration-200 hover:scale-[1.02] hover:shadow-lg hover:shadow-myGreen/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-myGreen focus-visible:ring-offset-2 focus-visible:ring-offset-bodyBg ${
                      selected
                        ? "border-myGreen shadow-md shadow-myGreen/20"
                        : "border-gray-700/80 hover:border-gray-600"
                    }`}
                  >
                    <div className="card-media rounded-lg">
                      <ImageWrap
                        image={item.img}
                        className="w-full h-full"
                        alt={item.name}
                        objectStatus="object-cover object-top"
                      />
                      {selected && (
                        <span className="absolute top-2 right-2 w-6 h-6 rounded-full bg-myGreen flex items-center justify-center text-navBg text-xs font-bold">
                          ✓
                        </span>
                      )}
                    </div>
                    <div className="p-3 sm:p-4 flex flex-col gap-2">
                      <div className="flex items-center justify-between gap-2">
                        <Text as="span" className="font-belanosima text-white text-base sm:text-lg truncate">
                          {item.name}
                        </Text>
                        {(() => {
                          const element = powerToElement(item.super_power);
                          const meta = ELEMENT_META[element];
                          return (
                            <span
                              className={`shrink-0 text-[10px] rounded-full px-2 py-0.5 ${meta.bg} ${meta.color}`}
                              title={item.super_power}
                            >
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
                        maxima={{ health: 100, strength: 14, attack: 18, speed: 11 }}
                      />
                      <span className="text-myYellow font-belanosima text-xs">
                        {item.price} pts
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selected + summary + CTA */}
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
                              image={character.img}
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
                Total: <span className="text-myYellow font-semibold">{totalCharacterPrice} points</span>
              </p>
              <p className="text-gray-400 font-poppins text-sm sm:text-base text-center">
                Available: <span className="text-white font-medium">{((profileData?.points as number) ?? 0) - totalCharacterPrice} points</span>
              </p>
            </div>

            <Button
              type="button"
              className="w-full text-navBg uppercase font-bold font-poppins text-sm sm:text-base tracking-wide py-3.5 sm:py-4 rounded-xl bg-myGreen hover:bg-myYellow transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              onClick={handlePurchaseCharacter}
              disabled={submiting}
            >
              {submiting ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-spin rounded-full h-5 w-5 border-2 border-navBg border-t-transparent" />
                  Purchasing…
                </span>
              ) : (
                "Purchase characters"
              )}
            </Button>
          </div>
        </div>
      </main>
    </section>
  );
};

export default PurchaseCharacter;

type DataType = {
  id: number;
  name: string;
  img: string;
  health: number;
  strength: number;
  attack: number;
  speed: number;
  superPower: string;
  totalWins: number;
  totalLoss: number;
  profileImg: string;
  price: number;
  owner: string;
};

export const data: DataType[] = [
  {
    id: 1,
    name: "Pikachu",
    img: Img1,
    health: 0,
    strength: 8,
    attack: 15,
    speed: 10,
    superPower: "Thunderbolt",
    totalWins: 270,
    totalLoss: 0,
    profileImg: Img1,
    price: 100,
    owner: "",
  },
  {
    id: 2,
    name: "Charizard",
    img: Img2,
    health: 95,
    strength: 10,
    attack: 13,
    speed: 7,
    superPower: "Flamethrower",
    totalWins: 390,
    totalLoss: 0,
    profileImg: Img2,
    price: 100,
    owner: "",
  },
  {
    id: 3,
    name: "Bulbasaur",
    img: Img3,
    health: 60,
    strength: 5,
    attack: 10,
    speed: 8,
    superPower: "Vine Whip",
    totalWins: 250,
    totalLoss: 0,
    profileImg: Img3,
    price: 100,
    owner: "",
  },
  {
    id: 4,
    name: "Squirtle",
    img: Img4,
    health: 90,
    strength: 10,
    attack: 16,
    speed: 9,
    superPower: "Water Gun",
    totalWins: 380,
    totalLoss: 0,
    profileImg: Img4,
    price: 100,
    owner: "",
  },
  {
    id: 5,
    name: "Jigglypuff",
    img: Img5,
    health: 75,
    strength: 7,
    attack: 13,
    speed: 9,
    superPower: "Sleep Song",
    totalWins: 300,
    totalLoss: 0,
    profileImg: Img5,
    price: 100,
    owner: "",
  },
  {
    id: 6,
    name: "Mewtwo",
    img: Img6,
    health: 90,
    strength: 12,
    attack: 16,
    speed: 6,
    superPower: "Psychic",
    totalWins: 380,
    totalLoss: 0,
    profileImg: Img6,
    price: 100,
    owner: "",
  },
  {
    id: 7,
    name: "Eevee",
    img: Img7,
    health: 100,
    strength: 11,
    attack: 15,
    speed: 7,
    superPower: "Adaptability",
    totalWins: 410,
    totalLoss: 0,
    profileImg: Img7,
    price: 100,
    owner: "",
  },
  {
    id: 8,
    name: "Gengar",
    img: Img8,
    health: 100,
    strength: 12,
    attack: 15,
    speed: 6,
    superPower: "Shadow Ball",
    totalWins: 420,
    totalLoss: 0,
    profileImg: Img8,
    price: 100,
    owner: "",
  },
];
