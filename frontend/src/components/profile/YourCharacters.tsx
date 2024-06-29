import Carousel from "react-multi-carousel";
import { Text } from "../atom/Text"
import { ImageWrap } from "../atom/ImageWrap";
import { useLocation } from 'react-router-dom';
import { useEffect, useState } from "react";
import { useActiveAccount } from "thirdweb/react";
import fetchNotices from "../../utils/readSubgraph";
import charactersdata from "../../utils/Charactersdata";


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

const YourCharacters = () => {
    const location = useLocation();
    const activeAccount = useActiveAccount();
    const [creatorCharacterDetails, setCreatorCharacterDetails] = useState<CharacterDetails[]>([]);



    function delay(ms: number) {
        return new Promise(resolve => setTimeout(resolve, ms));
      }

    useEffect(() => {
        async function fetchCharacters() {

            delay(3000);
            
            const placeholder = [];
                    
            const request_payload = await fetchNotices("all_characters");
            // console.log("PPayload...... ", JSON.parse(request_payload.opponent_warriors));
            const pPayload = request_payload.filter((character: CharacterDetails) => character.owner == activeAccount?.address.toLowerCase());
            console.log("your characters: " + pPayload);
            
            // const {Status: pStatus, request_payload: pPayload} = await readGameState(`get_duel_characters/${duelId}/${dPayload.duel_opponent}`); // Call your function
            // console.log(pPayload, "pPayload");
            
            for (let i = 0; i < pPayload.length; i++) {
                const characterData = charactersdata.find((character) => character.name === pPayload[i].name);
                console.log(characterData, "characterData");
                const details = {
                    ...pPayload[i],
                    img: characterData ? characterData.img : undefined,
                };
                placeholder.push(details);
            }
            setCreatorCharacterDetails(placeholder); //
        }

        fetchCharacters();
    }, [location]);


    const responsive = {
        superLargeDesktop: {
            // the naming can be any, depends on you.
            breakpoint: { max: 4000, min: 3000 },
            items: 5,
            partialVisibilityGutter: 30
        },
        desktop: {
            breakpoint: { max: 3000, min: 1024 },
            items: 4,
            partialVisibilityGutter: 30
        },
        tablet: {
            breakpoint: { max: 1024, min: 464 },
            items: 2,
            partialVisibilityGutter: 30
        },
        mobile: {
            breakpoint: { max: 464, min: 0 },
            items: 1,
        },
    };
    return (
        <section className="w-full h-auto bg-bodyBg">
            <main className="w-full lg:py-24 md:py-24 py-20 md:px-6 px-3 flex flex-col items-center gap-4">
                <Text as="h2" className="font-bold text-center uppercase lg:text-4xl md:text-3xl text-2xl font-barlow">All Your Characters</Text>


                <section className="w-full mt-7 px-3 md:px-0">
                    <Carousel responsive={responsive} itemClass="md:mx-3" infinite={true} showDots={true}>
                        {
                            creatorCharacterDetails.map((item, index) => (
                                <div className=" border-4 border-gray-800 bg-myBlack rounded-md p-3 mb-12 relative group cursor-pointer hover:border-myGreen/60 overflow-hidden" key={index}>
                                    <ImageWrap image={item.img} alt={item.name} className="w-full" objectStatus="object-contain" />
                                    <Text as="h5" className="mt-5 font-belanosima text-center text-xl">{item.name}</Text>

                                    {/* cover */}
                                    <div className="w-full h-full absolute -top-[100%] left-0 group-hover:top-0 bg-bodyBg z-10 transition-all duration-500 ease-out p-3 flex flex-col justify-center gap-4">
                                        <Text as="h5" className="font-belanosima text-gray-100 text-center font-semibold pt-2 text-xl">{item.name}</Text>

                                        <div className="flex flex-col gap-1.5 items-start">
                                            <Text as="h6" className="font-barlow text-myGreen font-semibold text-center text-base">Health Check</Text>
                                            <Text as="span" className="text-gray-300 text-xs md:text-sm font-poppins">Health: {item.health}</Text>
                                            <Text as="span" className="text-gray-300 text-xs md:text-sm font-poppins">Attack: {item.attack}</Text>
                                            <Text as="span" className="text-gray-300 text-xs md:text-sm font-poppins">Strength: {item.strength}</Text>
                                            <Text as="span" className="text-gray-300 text-xs md:text-sm font-poppins">Speed: {item.speed}</Text>
                                        </div>
                                        <div className="flex flex-col gap-1.5 items-start">
                                            <Text as="h6" className="font-barlow text-myGreen font-semibold text-center text-base">Score Board</Text>
                                            <Text as="span" className="text-gray-300 text-xs md:text-sm font-poppins">Total Wins: {item.total_wins}</Text>
                                            <Text as="span" className="text-gray-300 text-xs md:text-sm font-poppins">Total Loss: {item.total_losses}</Text>
                                            <Text as="span" className="text-gray-300 text-xs md:text-sm font-poppins">Price: {item.price} Points</Text>
                                        </div>
                                    </div>
                                </div>
                            ))
                        }
                    </Carousel>
                </section>
            </main>
        </section>
    )
}

export default YourCharacters