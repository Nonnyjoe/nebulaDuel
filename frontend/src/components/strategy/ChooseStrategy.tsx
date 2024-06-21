/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { Button } from "../atom/Button"
import { ImageWrap } from "../atom/ImageWrap"
import { Text } from "../atom/Text"
import { data } from "../profile/PurchaseCharacter"
import { toast } from "sonner";
import { HiOutlineArrowPath } from "react-icons/hi2";

interface StrategyInterface {
    id: number,
    name: string,
    code: string
}

const ChooseStrategy = () => {
    const [selectedStrategy, setSelectedStrategy] = useState<StrategyInterface[]>([]);

    const toggleStrategySelection = (strategy: any) => {
        const index = selectedStrategy.findIndex((c) => c.id === strategy.id);
        if (index < 0) {
            if (selectedStrategy.length < 1) {
                setSelectedStrategy([...selectedStrategy, strategy]);
            } else {
                toast.error("You can select only 1 strategy.", {
                    position: 'top-right'
                })
            }
        } else {
            const updatedStrategy = [...selectedStrategy];
            updatedStrategy.splice(index, 1);
            setSelectedStrategy(updatedStrategy);

            // setSubmitClicked(true);
            // Input(rollups, dappAddress, functionParamsAsString, false);
        }
    };

    const handleReset = () => {
        setSelectedStrategy([]);
    }

    const handleStrategySelection = (e: any) => {
        e.preventDefault();
    }
    return (
        <main className="w-full flex flex-col gap-8 items-center lg:py-24 md:py-24 py-20 px-3 md:px-5">
            <section className="w-full grid lg:grid-cols-2  lg:gap-36 md:gap-10 gap-3">
                <main className="flex flex-col gap-3">
                    <Text as="h4" className="text-2xl pl-3 font-belanosima">Opponent Warriors</Text>
                    <div className="w-full grid grid-cols-3 gap-3">
                        {
                            data.slice(0, 3).map((item, index) => (
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
                    <Text as="h4" className="text-2xl pl-3 font-belanosima">Your Warriors</Text>
                    <div className="w-full grid grid-cols-3 gap-3">
                        {
                            data.slice(0, 3).map((item, index) => (
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
            </section>

            <section className="lg:w-[70%] md:w-[90%] w-full mt-12 flex flex-col items-center gap-4">
                <Text as="h2" className="text-3xl pl-3 text-center font-belanosima">Select Attack Strategy</Text>

                <div className="w-full grid md:grid-cols-4 grid-cols-2 gap-3">
                    {
                        strategy.map((item) => {
                            const isSelected = selectedStrategy.some((c) => c.id === item.id);

                            return (<div className={`w-full border-4 border-gray-800 bg-myBlack flex flex-col items-center gap-2 cursor-pointer hover:border-myGreen/40 transition-all duration-200 rounded-md p-4  ${isSelected ? "border-myGreen/40" : "border-gray-800"}`} key={item.id} onClick={() => toggleStrategySelection(item)}>
                                <Text as="h4" className="text-center">
                                    {item.name}
                                </Text>
                            </div>)

                        })
                    }
                </div>
                <div className="flex gap-3 items-center">
                    <Button type="button" className="mt-4 text-[#0f161b] uppercase font-bold tracking-[1px] text-sm px-[30px] py-3.5 border-[none] bg-[#45f882]  font-barlow hover:bg-[#ffbe18] clip-path-polygon-[100%_0,100%_65%,89%_100%,0_100%,0_0]" onClick={handleStrategySelection}>Set Strategy</Button>
                    {
                        selectedStrategy.length > 0 && <Button type="button" className="bg-myGreen text-gray-950 p-2 rounded-full z-10 font-bold text-lg" onClick={handleReset}>
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