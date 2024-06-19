import { ImageWrap } from "../atom/ImageWrap"
import MaxWrapper from "../shared/MaxWrapper"
import Img1 from "../../assets/creators/nft_img01.jpg"
import Img2 from "../../assets/creators/nft_img02.jpg"
import Img3 from "../../assets/creators/nft_img03.jpg"
import Avatar1 from "../../assets/creators/nft_avatar01.png"
import Avatar2 from "../../assets/creators/nft_avatar02.png"
import Avatar3 from "../../assets/creators/nft_avatar03.png"
import { useMemo } from "react"
import { Text } from "../atom/Text"
import { Button } from "../atom/Button"
import { MdArrowRightAlt } from "react-icons/md"
import { creators } from "../../data/ContentData"



const Creators = () => {

    const imgList = useMemo(() => [Img1, Img2, Img3], []);
    const avatartList = useMemo(() => [Avatar1, Avatar2, Avatar3], []);

    return (
        <MaxWrapper className="w-full flex justify-center md:py-24 py-16">
            <section className="flex md:flex-row flex-col flex-wrap justify-center gap-6 w-full px-8 md:px-0">
                {
                    creators.map((creator, index) => (
                        <div key={index} className="flex md:flex-row flex-col gap-4 md:p-6 p-8 bg-[#121a23] bg-[linear-gradient(0deg,#0c0e12_0%,rgba(31,41,53,0.36078)_100%)] rounded-md cursor-pointer border border-[rgba(76,76,76,0.2)] hover:border-[rgba(69,248,130,0.4)]">
                            <ImageWrap image={imgList[index]} alt="Creator" className="md:w-[180px] w-full h-[187px]" objectStatus="object-cover rounded-md" />
                            <div className="w-full h-full flex-1 flex-col justify-center items-start">
                                <Text as="h4" className="uppercase text-gray-100 font-bold font-barlow text-xl">{creator.title}</Text>
                                <div className="w-full flex gap-4 items-center my-4">
                                    <ImageWrap image={avatartList[index]} alt="Avatar" className="w-[40px] h-[40px] rounded-full" objectStatus="object-cover" />
                                    <Text as="span" className="text-gray-400 font-medium font-barlow text-xl">{creator.createdBy}</Text>
                                    <Text as="span" className="flex border-l-2 uppercase border-gray-500 text-sm pl-4">creator</Text>
                                </div>

                                <div className="w-full py-4 flex justify-between px-4 items-center gap-4 rounded-md border border-[rgba(76,76,76,0.4)]">
                                    <Text as="p" className="flex items-center gap-2 font-bold text-gray-100">
                                        {creator.amount}
                                        <Text as="span" className=" text-myYellow font-bold font-barlow text-lg">ETH</Text>
                                    </Text>
                                    <Button type="button" className="flex items-center gap-1 bg-myYellow hover:bg-myGreen text-myBlack px-4 rounded-md py-2">
                                        <Text as="span" className="text-lg font-poppins">Buy</Text>
                                        <MdArrowRightAlt className="text-2xl" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ))
                }

            </section>
        </MaxWrapper>
    )
}

export default Creators