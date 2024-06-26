/* eslint-disable @typescript-eslint/no-explicit-any */
import { toast } from 'sonner';
import { ImageWrap } from "../atom/ImageWrap"
import { Text } from "../atom/Text"
import { Button } from "../atom/Button"
import { useState } from "react";
import { HiOutlineArrowPath } from "react-icons/hi2";
import readGameState from "../../utils/readState.js"
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import charactersdata from '../../utils/Charactersdata';
import { useActiveAccount } from "thirdweb/react";



interface Character {
    id: number;
    name: string;
    img: string;
    price: number;
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
interface ProfileData {
    monika: string;
    wallet_address: string;
    avatar_url: string;
    characters: string;
    id: number;
    // Add other properties if needed
}

const SelectWarriors = () => {
    const location = useLocation();
    const [selectedCharacters, setSelectedCharacters] = useState<Character[]>([]);
    const [totalCharacterPrice, setTotalCharacterPrice] = useState<number>(0);
    // const [submitClicked, setSubmitClicked] = useState(false);
    const [selectedCharactersId, setSelectedCharactersId] = useState<number[]>([]);
    const [profileData, setProfileData] = useState<ProfileData | null>(null);
    const [characterDetails, setCharacterDetails] = useState<CharacterDetails[]>([]);
    const navigate = useNavigate();
    const activeAccount = useActiveAccount();




    useEffect(() => {
        const fetchData = async () => {
            const {Status, request_payload} = await readGameState(`profile/${activeAccount?.address}`); // Call your function

            if(Status === false){
                navigate('/profile');
            }else{
                // if(request_payload.characters.length >= 3){
                //     setProfileData(request_payload);
                // }else{
                //     navigate('/profile/purchasecharacter');
                setProfileData(request_payload);
            }
        };

        fetchData(); // Call the function on component mount
    }, [location]);


    useEffect(() => {
        if (profileData && profileData.characters) {
            const characters = JSON.parse(profileData.characters.replace(/\\/g, ''));
    
            console.log(characters, "characters");
    
            const charIds = characters.map((character: any) => character.char_id);
            console.log(charIds, "charIds");
    
            const fetchedIds = new Set(); // Store fetched IDs to avoid duplicates

            const fetchCharacterDetails = async (remainingIds: any[]) => {
                if (remainingIds === undefined) {
                    return;
                }
    
                try {
                    if (remainingIds.length === 0) {
                        return; // No more characters to fetch
                    }
    
                    const id = remainingIds.shift();
                    console.log(id, "this is the id");
    
                    if (fetchedIds.has(id)) {
                        console.log(`Skipping duplicate fetch for character ${id}`);
                        return fetchCharacterDetails(remainingIds); // Skip if already fetched and continue
                    }
                    fetchedIds.add(id); // Add ID to the set
    
                    const timeout = setTimeout(() => {
                        console.error(`Timeout fetching character ${id}`);
                    }, 1000); // Set timeout to 1 seconds (adjust as needed)
    
                    const { Status, request_payload } = await readGameState(`characters/${id}`);
                    clearTimeout(timeout); // Clear timeout if successful
    
                    if (Status) {
                        const characterData = charactersdata.find(
                            (character) => character.name === request_payload.name
                        );
                        const details = {
                            ...request_payload,
                            img: characterData ? characterData.img : undefined,
                        };
                        setCharacterDetails((prevDetails) => {
                            if (prevDetails.some(detail => detail.id === details.id)) {
                                return prevDetails; // Avoid adding duplicates
                            }
                            return [...prevDetails, details];
                        });
                    }
        
                    fetchCharacterDetails(remainingIds); // Recursive call after delay
                } catch (error) {
                    console.error('Error fetching character details:', error);
                }
            };  
            
            console.log(charIds, "id passed to recursive function");
            fetchCharacterDetails([...charIds]); // Start with a copy of charIds
        }
    }, [profileData]);

    


 
    if (!profileData) {
        navigate('/profile');
    }

    if (!profileData?.characters) {
        return <div>
            <Link to='/profile/purchasecharacter' className="bg-[#45f882] text-black font-bold py-2 px-4 rounded-full hover:bg-green-500">
                You don't have any characters. Click here to create one.
              </Link>

        </div>;
    }

    //const characrtersId = profileData?.characters.map((item: any) => item.id);

        // Parse the characters JSON string
        // const characters: Character[] = JSON.parse(profileData.characters.replace(/\\/g, ''));

        // // Extract the char_id values
        // const charIds = characters.map((character: Character) => character.char_id);

        // async function fetchCharacters() {
        //     const {Status, request_payload} = await readGameState(`characters/${id}`);
        //     return {Status, request_payload};
        //   }






    const toggleCharacterSelection = (character: Character) => {
        const index = selectedCharacters.findIndex((c) => c.id === character.id);
        if (index < 0) {
            if (selectedCharacters.length < 3) {
                setSelectedCharacters([...selectedCharacters, character]);
                setSelectedCharactersId([...selectedCharactersId, character.id]);
                setTotalCharacterPrice(character.price + totalCharacterPrice);
            } else {
                toast.error("You can select only 3 characters.", {
                    position: 'top-right'
                })
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
        setSelectedCharactersId([])
    }

    const handleSelectWarriors = (e: any) => {
        e.preventDefault()
    }

    return (
        <section className="w-full h-auto bg-bodyBg">
            <main className="w-full lg:py-24 md:py-24 py-20 md:px-6 px-3 flex flex-col items-center gap-4">
                <Text as="h2" className="font-bold text-center uppercase lg:text-4xl md:text-3xl text-2xl font-barlow">Choose your warriors!</Text>


                <section className=" w-full mt-12 grid lg:grid-cols-2 lg:gap-10 md:gap-20 gap-14">
                    <main className="w-full flex flex-col gap-4">
                        <Text as="h3" className="font-semibold font-belanosima text-2xl tracking-wide text-center">Your Characters</Text>
                        <div className="w-full grid md:grid-cols-4 grid-cols-2 gap-4 md:gap-6 lg:gap-4 md:px-2 lg:px-0">
                            {
                                characterDetails.map((item, index) => (
                                    <div key={index} className={`w-full border ${selectedCharactersId.includes(item.id) ? 'border-myGreen' : 'border-gray-800'} border-gray-800 bg-gray-900 flex flex-col items-center gap-2 cursor-pointer hover:border-myGreen/40 transition-all duration-200 rounded-md p-4`} onClick={() => toggleCharacterSelection(item)}>
                                        <ImageWrap image={item.img} className="w-full" alt={item.name} objectStatus="object-contain" />
                                        <Text as="h5" className="font-belanosima">{item.name}</Text>
                                        <div className="w-full grid grid-cols-2 gap-1">
                                            <Text as="span" className="text-gray-300 text-xs font-poppins">Health: {item.health}</Text>
                                            <Text as="span" className="text-gray-300 text-xs font-poppins">Attack: {item.attack}</Text>
                                            <Text as="span" className="text-gray-300 text-xs font-poppins">Strength: {item.strength}</Text>
                                            <Text as="span" className="text-gray-300 text-xs font-poppins">Speed: {item.speed}</Text>
                                        </div>
                                    </div>
                                ))
                            }

                        </div>
                    </main>


                    <main className="w-full flex flex-col items-center gap-4">
                        <Text as="h3" className="font-semibold font-belanosima text-2xl tracking-wide text-center">Selected Characters</Text>

                        <div className="w-full relative md:w-[70%] lg:w-full grid grid-cols-3 md:gap-3 border border-gray-800 bg-gray-900 lg:h-[360px] md:h-[240px] h-[260px] rounded-md">
                            {selectedCharacters?.map((character) => (
                                <div key={character.id} className="w-full bg-gray-900 flex flex-col items-center gap-2 cursor-pointer hover:border-myGreen/40 transition-all duration-200 rounded-md md:p-4 p-2">
                                    <ImageWrap image={character.img} className="w-full" alt={character.name} objectStatus="object-contain" />
                                    <Text as="h5" className="font-belanosima">{character.name}</Text>
                                </div>
                            ))}
                            {
                                selectedCharacters.length > 0 && <Button type="button" className="bg-myGreen text-gray-950 p-2 rounded-full absolute right-2 bottom-2 z-10 font-bold text-lg" onClick={handleReset}>
                                    <HiOutlineArrowPath />
                                </Button>
                            }

                        </div>

                        <Button type="button" className=" text-[#0f161b] uppercase font-bold tracking-[1px] text-sm px-[30px] py-3.5 border-[none] bg-[#45f882]  font-barlow hover:bg-[#ffbe18] clip-path-polygon-[100%_0,100%_65%,89%_100%,0_100%,0_0]" onClick={handleSelectWarriors}>Create Duel</Button>
                    </main>
                </section>
            </main>
        </section>
    )
}

export default SelectWarriors

