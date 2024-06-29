/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { Button } from "../atom/Button"
import { ImageWrap } from "../atom/ImageWrap"
import { Text } from "../atom/Text"
// import { data } from "../profile/PurchaseCharacter"
import { toast } from "sonner";
import { HiOutlineArrowPath } from "react-icons/hi2";
import { useParams } from "react-router-dom"
// import readGameState from "../../utils/readState.js"
import signMessages from "../../utils/relayTransaction.tsx"
import { useActiveAccount } from "thirdweb/react";
import { useEffect } from 'react';
// import { useLocation } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import charactersdata from '../../utils/Charactersdata';
import { useProfileContext } from "../contexts/ProfileContext.js";
import fetchNotices from "../../utils/readSubgraph.js";

interface StrategyInterface {
    id: number,
    name: string,
    code: string
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
    const { duelId } = useParams()
    console.log("setting strategy for duel id: ", duelId)
    const [selectedStrategy, setSelectedStrategy] = useState<StrategyInterface | undefined>( );
    // const [profileData, setProfileData] = useState<ProfileData | null>(null);
    const [creatorCharacterDetails, setCreatorCharacterDetails] = useState<CharacterDetails[]>([]);
    const [opponentCharacterDetails, setOpponetCharacterDetails] = useState<CharacterDetails[]>([]);
    const [duelCreator, setDuelCreator] = useState<string>(" ");
    const [duelJoiner, setDuelJoiner] = useState<string>(" ");
    const [duelType, setDuelType] = useState<string>(" ");
    // const [refresher, setRefresher] = useState<number>();
    const navigate = useNavigate();
    const activeAccount = useActiveAccount();
    const {profile, setProfile} = useProfileContext();
    const [submiting, setSubmiting] = useState<boolean>(false);


    useEffect(() => {
        const fetchData = async () => {
            if (activeAccount?.address.toLowerCase() != profile?.wallet_address?.toLowerCase()) {
                navigate('/profile');
            } else{
                let dPayload = await fetchNotices("all_duels");
                dPayload = dPayload.filter((Payload: any) => Number(Payload.duel_id) == Number(duelId))[0];

                    console.log(dPayload, "dPayload");
                    setDuelCreator(dPayload.duel_creator);
                    setDuelJoiner(dPayload.duel_opponent);
                    setDuelType(dPayload.difficulty);
                    if ((activeAccount?.address)?.toLowerCase() == dPayload.duel_creator) {
                        console.log("You are the creator!!")
                    } else if ((activeAccount?.address)?.toLowerCase() == dPayload.duel_opponent) {
                        console.log("You are the joiner!!");
                    } else {
                        if (dPayload.is_complete == true) {
                            navigate(`/duels/${duelId}`);
                        } else {
                            console.log("Invalid position in duel!");
                            navigate(`/joinduel/${duelId}`);
                        }
                    }

                    const request_payload = await fetchNotices("all_characters");
                    const cPayload = request_payload.filter((character: CharacterDetails) => character.id == JSON.parse(dPayload.creator_warriors)[0].char_id || character.id == JSON.parse(dPayload.creator_warriors)[1].char_id || character.id == JSON.parse(dPayload.creator_warriors)[2].char_id);
                    console.log("creator characters: " + request_payload);

                    // const {Status: cStatus, request_payload: cPayload} = await readGameState(`get_duel_characters/${duelId}/${dPayload.duel_creator}`); // Call your function
                    console.log(cPayload, "cPayload");
                    
                    let placeholder = []; 

                    for (let i = 0; i < cPayload.length; i++) {
                        const characterData = charactersdata.find((character) => character.name === cPayload[i].name);
                        console.log(characterData, "characterData");
                        const details = {
                            ...cPayload[i],
                            img: characterData ? characterData.img : undefined,
                        };
                        placeholder.push(details);
                    }
                    setCreatorCharacterDetails(placeholder);
                    placeholder = [];
                    
                    const request_payload2 = await fetchNotices("all_characters");
                    const pPayload = request_payload2.filter((character: CharacterDetails) => character.id == JSON.parse(dPayload.opponent_warriors)[0].char_id || character.id == JSON.parse(dPayload.opponent_warriors)[1].char_id || character.id == JSON.parse(dPayload.opponent_warriors)[2].char_id);
                    console.log("participant characters: " + request_payload);

                    // const {Status: pStatus, request_payload: pPayload} = await readGameState(`get_duel_characters/${duelId}/${dPayload.duel_opponent}`); // Call your function
                    console.log(pPayload, "pPayload");

                    for (let i = 0; i < pPayload.length; i++) {
                        const characterData = charactersdata.find((character) => character.name === pPayload[i].name);
                        console.log(characterData, "characterData");
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
        setSelectedStrategy( undefined );
    }

    const handleStrategySelection = async (e: any) => {
        e.preventDefault();
        console.log(selectedStrategy?.id);
        console.log(duelJoiner);

        if (opponentCharacterDetails.length == 3) {
            if (selectedStrategy != undefined) {

                const dataObject1 = {"func": "set_strategy", "strategy_id": selectedStrategy.id, "duel_id": duelId};
                const dataObject2 = {"func": "select_ai_battle_strategy", "strategy_id": Number(selectedStrategy.id), "duel_id": Number(duelId)};
                console.log(dataObject1, "dataObject");
                console.log("...........", duelType);
                // const prevNoOfTx = getArrayLength(profile?.transaction_history as string) as number;
                setSubmiting(true);
                let txhash;
                if( duelType.toLowerCase() != ("P2P".toLowerCase())) {
                    txhash = await signMessages(dataObject2);
                } else {
                    txhash = await signMessages(dataObject1);
                }
                // if (true) {
                    if (txhash.message === "Transaction added successfully") {
                       
                    let request_payload = await fetchNotices("all_tx");
                    // console.log("payload is:", request_payload);
                    request_payload = request_payload.filter((tx: any) => tx.caller == activeAccount?.address.toLowerCase());
                    let Highest_tx;
                    Highest_tx = request_payload[0];
                    for (let i = 0; i < request_payload.length; i++) {
                        if (request_payload[i].tx_id > Highest_tx.tx_id) {
                            Highest_tx = request_payload[i];
                        }
                    }
        
                    if (Highest_tx.method == "set_strategy" || Highest_tx.method == "select_ai_battle_strategy" || Highest_tx.method == "") {
                        toast.success("Transaction Successful.. Duel Created", {
                            position: 'top-right'
                        })
                        let request_payload = await fetchNotices("all_profiles");
                        request_payload = request_payload.filter((player: any) => player.wallet_address == activeAccount?.address.toLowerCase());
                        
                        setProfile(request_payload[0]);
                        setSubmiting(false);
                        navigate(`/duels/${duelId}`);
                    } else {
                        toast.error("Transaction Failed.. Try again later.", {
                            position: 'top-right'
                        });
                        setSubmiting(false);
                    }
                    
                    
                } else {
                    toast.error("Failed to set strategy. Please try again later.", {
                        position: "top-right",
                    });
                    setSubmiting(false);
                }

            } else {
                toast.error("Please select a strategy before starting duel.", {
                    position: "top-right",
                });
                setSubmiting(false);
                return;
            }
        } else {
            toast.error("Please wait for opponent to join before starting duel.", {
                position: "top-right",
            });
            setSubmiting(false);
            return;
        }
        setSubmiting(false);
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

    
    return (
        <main className="w-full flex flex-col gap-8 items-center lg:py-24 md:py-24 py-20 px-3 md:px-5">
            <section className="w-full grid lg:grid-cols-2  lg:gap-36 md:gap-10 gap-3">
                <main className="flex flex-col gap-3">
                    <Text as="h4" className="text-2xl pl-3 font-belanosima">Your Warriors</Text>
                    <div className="w-full grid grid-cols-3 gap-3 mt-10">
                        {
                            getYourWarriors().map((item, index) => (
                                <div className="w-full border border-gray-800 bg-gray-900 flex flex-col items-center gap-2 cursor-pointer hover:border-myGreen/40 transition-all duration-200 rounded-md p-4" key={index}>
                                    <ImageWrap image={item.img} className="w-full" alt={item.name} objectStatus="object-contain" />
                                    <Text as="h5" className="font-belanosima">{item.name}</Text>
                                    <div className="w-full grid md:grid-cols-2 gap-1">
                                        <Text as="span" className="text-gray-500 text-xs font-poppins">Health: {item.health}</Text>
                                        <Text as="span" className="text-gray-500 text-xs font-poppins">Attack: {item.attack}</Text>
                                        <Text as="span" className="text-gray-500 text-xs font-poppins">Strength: {item.strength}</Text>
                                        <Text as="span" className="text-gray-500 text-xs font-poppins">Speed: {item.speed}</Text>
                                    </div>
                                </div>
                            ))
                        }
                    </div>
                </main>
                <main className="flex flex-col gap-3">
                    <Text as="h4" className="text-2xl pl-3 font-belanosima">Opponent Warriors</Text>
                   {getOtherWarriors().length > 0 ? (
                        <div className="w-full grid grid-cols-3 gap-3 mt-10">
                            { getOtherWarriors().map((item, index) => (
                                <div className="w-full border border-gray-800 bg-gray-900 flex flex-col items-center gap-2 cursor-pointer hover:border-myGreen/40 transition-all duration-200 rounded-md p-4" key={index}>
                                    <ImageWrap image={item.img} className="w-full" alt={item.name} objectStatus="object-contain" />
                                    <Text as="h5" className="font-belanosima">{item.name}</Text>
                                    <div className="w-full grid md:grid-cols-2 gap-1">
                                        <Text as="span" className="text-gray-500 text-xs font-poppins">Health: {item.health}</Text>
                                        <Text as="span" className="text-gray-500 text-xs font-poppins">Attack: {item.attack}</Text>
                                        <Text as="span" className="text-gray-500 text-xs font-poppins">Strength: {item.strength}</Text>
                                        <Text as="span" className="text-gray-500 text-xs font-poppins">Speed: {item.speed}</Text>
                                    </div>
                                </div>
                            ))}
                        </div>)
                        : 
                        (
                            <div className=" mt-10 w-full h-[35vh] border border-gray-800 bg-gray-900 flex flex-col items-center gap-2 cursor-pointer hover:border-myGreen/40 transition-all duration-200 rounded-md p-4">
                               <div className=" mt-auto mb-auto">
                                    <Text as="h5" className="font-belanosima text-center mb-6">Waiting for Opponent to Join.......</Text>
                                    <div className="animate-spin rounded-full ml-auto mr-auto h-20 w-20 border-t-2 border-b-2 border-myGreen"></div>
                               </div>
                            </div>
                        )
                    }
                </main>
            </section>

            <section className="lg:w-[70%] md:w-[90%] w-full mt-12 flex flex-col items-center gap-4">
                <Text as="h2" className="text-3xl pl-3 text-center font-belanosima">Select Attack Strategy</Text>

                <div className="w-full grid md:grid-cols-4 grid-cols-2 gap-3">
                    {
                        strategy.map((item) => {

                            return (<div className={`w-full border-4 border-gray-800 bg-myBlack flex flex-col items-center gap-2 cursor-pointer hover:border-[#ffbe18] transition-all duration-200 rounded-md p-4  ${selectedStrategy?.id == item.id  ? "border-myGreen/40" : "border-gray-800"}`} key={item.id} onClick={() => toggleStrategySelection(item)}>
                                <Text as="h4" className="text-center">
                                    {item.name}
                                </Text>
                            </div>)

                        })
                    }
                </div>
                <div className="flex gap-3 items-center">
                    <Button type="button" className="mt-4 text-[#0f161b] uppercase font-bold tracking-[1px] text-sm px-[30px] py-3.5 border-[none] bg-[#45f882]  font-barlow hover:bg-[#ffbe18] clip-path-polygon-[100%_0,100%_65%,89%_100%,0_100%,0_0]" onClick={handleStrategySelection}>
                    {submiting ? 
                        (<div className="animate-spin rounded-full ml-auto mr-auto h-6 w-6 border-t-2 border-b-2 border-yellow-900"></div>)
                        : 
                        "Set Strategy"
                    }
                    </Button>
                    {
                        selectedStrategy != undefined && <Button type="button" className="bg-myGreen text-gray-950 p-2 rounded-full z-10 font-bold text-lg" onClick={handleReset}>
                            <HiOutlineArrowPath />
                        </Button>
                    }
                </div>

            </section>
        </main>
    )
}

export default ChooseStrategy

type StrategyType = {
    id: number,
    name: string,
    code: string
}

const strategy: StrategyType[] = [
    {
        id: 1,
        name: "MaxHealth To Lowest Health",
        code: 'M2LH',
    },
    {
        id: 2,
        name: "LowestHealth To MaxHealth",
        code: 'L2MH',
    },
    {
        id: 3,
        name: "MaxStrength To LowestStrength",
        code: 'M2LS',
    },
    {
        id: 4,
        name: "LowestStrength To MaxStrength",
        code: 'l2MS',
    }
]