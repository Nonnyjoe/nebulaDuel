import { ImageWrap } from "../atom/ImageWrap"
import { Text } from "../atom/Text"
import { data } from "../profile/PurchaseCharacter"


const GameArena = () => {
    return (
        <section className="w-full lg:py-24 md:py-24 py-20 px-3 md:px-5 grid lg:grid-cols-5 md:gap-6 gap-3 grid-cols-2">
            <aside className="flex order-2 lg:order-1 flex-col gap-4">
                <Text as="h3" className="md:text-xl text-base mt-6 font-medium font-barlow text-center">Your Character</Text>
                <main className="w-full grid md:gap-6 gap-3">
                    {
                        data.slice(0, 3).map((item, index) => (
                            <div className="w-full grid grid-cols-2 gap-2 border border-gray-400 bg-myBlack p-1.5 rounded-md" key={index}>
                                <ImageWrap image={item.img} alt={item.name} className="w-full" objectStatus="object-cover" />
                                <div className="flex flex-col items-center justify-center">
                                    <Text as="h4" className="text-myGreen font-belanosima text-sm font-medium text-center mb-2">{item.name}</Text>
                                    <Text as="span" className="text-xs text-gray-400 mb-1">HLT: {item.health}</Text>
                                    <Text as="span" className="text-xs text-gray-400 mb-1">STR: {item.strength}</Text>
                                    <Text as="span" className="text-xs text-gray-400">ATK: {item.attack}</Text>
                                </div>
                            </div>
                        ))
                    }
                </main>
            </aside>
            <main className="lg:col-span-3 col-span-2 order-1 lg:order-2 flex flex-col gap-4">
                <Text as="h3" className="text-4xl font-medium font-belanosima text-center tracking-wider">Arena</Text>

                <div className="w-full h-[450px] bg-myBlack border-4 border-gray-600 battleGround rounded-md"></div>
            </main>
            <aside className="flex order-3 lg:order-3 flex-col gap-4">
                <Text as="h3" className="md:text-xl text-base mt-6 font-medium font-barlow text-center">Your Opponent</Text>

                <main className="w-full grid md:gap-6 gap-3">
                    {
                        data.slice(4, 7).map((item, index) => (
                            <div className="w-full grid grid-cols-2 gap-2 border border-gray-400 bg-myBlack p-1.5 rounded-md" key={index}>
                                <ImageWrap image={item.img} alt={item.name} className="w-full" objectStatus="object-cover" />
                                <div className="flex flex-col items-center justify-center">
                                    <Text as="h4" className="text-myGreen font-belanosima text-sm font-medium text-center mb-2">{item.name}</Text>
                                    <Text as="span" className="text-xs text-gray-400 mb-1">HLT: {item.health}</Text>
                                    <Text as="span" className="text-xs text-gray-400 mb-1">STR: {item.strength}</Text>
                                    <Text as="span" className="text-xs text-gray-400">ATK: {item.attack}</Text>
                                </div>
                            </div>
                        ))
                    }
                </main>
            </aside>
        </section>
    )
}

export default GameArena