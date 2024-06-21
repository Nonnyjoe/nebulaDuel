/* eslint-disable @typescript-eslint/no-explicit-any */
import { toast } from 'sonner';
import { ImageWrap } from "../atom/ImageWrap"
import { Text } from "../atom/Text"
import Img1 from "../../assets/img/Rhyno.png";
import Img2 from "../../assets/img/Dragon.png";
import Img3 from "../../assets/img/Godzilla.png";
import Img4 from '../../assets/img/Hound.png';
import Img5 from '../../assets/img/KomodoDragon.png';
import Img6 from '../../assets/img/IceBeever.png';
import Img7 from '../../assets/img/Fox.png';
import Img8 from "../../assets/img/komodo.png"
import { Button } from "../atom/Button"
import { useState } from "react";
import { HiOutlineArrowPath } from "react-icons/hi2";
interface Character {
    id: number;
    name: string;
    img: string;
    price: number;
}

const SelectWarriors = () => {
    const [selectedCharacters, setSelectedCharacters] = useState<Character[]>([]);
    const [totalCharacterPrice, setTotalCharacterPrice] = useState<number>(0);
    // const [submitClicked, setSubmitClicked] = useState(false);
    const [selectedCharactersId, setSelectedCharactersId] = useState<number[]>([]);

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
                        <div className="w-full grid md:grid-cols-3 grid-cols-2 gap-4 md:gap-6 lg:gap-4 md:px-2 lg:px-0">
                            {
                                data.map((item, index) => (
                                    <div className="w-full border border-gray-800 bg-gray-900 flex flex-col items-center gap-2 cursor-pointer hover:border-myGreen/40 transition-all duration-200 rounded-md p-4" key={index} onClick={() => toggleCharacterSelection(item)}>
                                        <ImageWrap image={item.img} className="w-full" alt={item.name} objectStatus="object-contain" />
                                        <Text as="h5" className="font-belanosima">{item.name}</Text>
                                        <div className="w-full grid grid-cols-2 gap-1">
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


                    <main className="w-full flex flex-col items-center gap-4">
                        <Text as="h3" className="font-semibold font-belanosima text-2xl tracking-wide text-center">Selected Characters</Text>

                        <div className="w-full relative md:w-[70%] lg:w-full grid grid-cols-3 md:gap-3 border border-gray-800 bg-gray-900 lg:h-[260px] md:h-[200px] h-[180px] rounded-md">
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

type DataType = {
    id: number,
    name: string,
    img: string,
    health: number,
    strength: number,
    attack: number,
    speed: number,
    superPower: string,
    totalWins: number,
    totalLoss: number,
    profileImg: string,
    price: number,
    owner: string
}




const data: DataType[] = [
    {
        id: 1,
        name: "Pikachu",
        img: Img1,
        health: 80,
        strength: 8,
        attack: 15,
        speed: 10,
        superPower: "Thunderbolt",
        totalWins: 270,
        totalLoss: 0,
        profileImg: Img1,
        price: 100,
        owner: ""
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
        owner: ""
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
        owner: ""
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
        owner: ""
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
        owner: ""
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
        owner: ""
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
        owner: ""
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
        owner: ""
    }
]