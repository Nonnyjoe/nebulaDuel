import { Text } from "../atom/Text"
import Circle from "../../assets/img/circle.svg";
import { ImageWrap } from "../atom/ImageWrap";
import mask1 from "../../assets/img/mask_img01.jpg"
import mask2 from "../../assets/img/mask_img02.jpg"

const AboutUs = () => {
    return (
        <section className="w-full h-auto bg-navBg relative z-10 flex flex-col">
            <main className="w-full h-full pt-32 pb-48 md:px-6 px-3 grid gap-6 md:gap-0 md:grid-cols-2">
                <aside className="w-full flex flex-col lg:gap-20 gap-12">
                    <Text as={`h1`} className=" uppercase font-extralight font-barlow lg:text-[55px] text-4xl tracking-[3.5px] leading-none md:text-left text-center">
                        WE ARE <br className="hidden md:block" />
                        <span className="font-semibold text-myGreen">DEVELOPERS</span>
                        <br className="hidden md:block" /> OF THE <span className="font-semibold text-myGreen">Nebula</span>
                        <br className="hidden md:block" /> GAM<span className="font-semibold">ING</span>
                    </Text>

                    <div className="rotater w-[125px] h-[125px] relative self-center">
                        <img src={Circle} alt="RotatoryImg" />
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 150 150"
                            version="1.1"
                        >
                            <path id="textPath" d="M 0,75 a 75,75 0 1,1 0,1 z"></path>
                            <text className="uppercase text-[25px] tracking-wider">
                                <textPath href="#textPath">super nft Gaming sits</textPath>
                            </text>
                        </svg>
                    </div>
                </aside>

                <aside className="w-full flex flex-col relative">
                    <main className="w-full md:h-[450px] h-[550px] mt-16 grid gap-3 grid-cols-5 grid-rows-2 relative">
                        <ImageWrap image={mask1} className="row-span-2 col-span-2" alt="Image" objectStatus="object-cover" />
                        <ImageWrap image={mask2} className="col-span-3" objectStatus="object-cover" alt="Image" />
                        <div className=" absolute top-1/2 left-1/2 bg-myGreen h-12 w-12"></div>
                    </main>
                    <Text as="p" className="text-gray-400 bg-navBg absolute -bottom-8 py-3 text-base md:text-lg font-medium">
                        Lorem ipsum dolor sit amet, consteur adipiscing Duis elementum sollicitudin is yaugue euismods Nulla ullamcorper. Morbi pharetra tellus miolslis tincidunt massa venenatis. Lorem Ipsum is simply dummyd the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s when an unknown printer took a galley.</Text>

                    <div className="absolute text-[#45f882] groupOfBars right-[22px] top-5 
                            xl:right-[50px] xl:top-[15px]
                            md:right-3 md:top-[7px]
                            sm:right-[65px] sm:top-[7px]
                            ">
                        <svg className=" block w-[109px] h-[35px]" width="109" height="35" viewBox="0 0 109 35"
                            fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M9 0H0V7H9V0Z" fill="currentColor" />
                            <path d="M24 0H15V7H24V0Z" fill="currentColor" />
                            <path d="M38 0H29V7H38V0Z" fill="currentColor" />
                            <path d="M53 0H44V7H53V0Z" fill="currentColor" />
                            <path d="M67 0H58V7H67V0Z" fill="currentColor" />
                            <path d="M80 0H71V7H80V0Z" fill="currentColor" />
                            <path d="M9 14H0V21H9V14Z" fill="currentColor" />
                            <path d="M24 14H15V21H24V14Z" fill="currentColor" />
                            <path d="M38 14H29V21H38V14Z" fill="currentColor" />
                            <path d="M53 14H44V21H53V14Z" fill="currentColor" />
                            <path d="M67 14H58V21H67V14Z" fill="currentColor" />
                            <path d="M80 14H71V21H80V14Z" fill="currentColor" />
                            <path d="M95 14H86V21H95V14Z" fill="currentColor" />
                            <path d="M109 14H100V21H109V14Z" fill="currentColor" />
                            <path d="M9 28H0V35H9V28Z" fill="currentColor" />
                            <path d="M24 28H15V35H24V28Z" fill="currentColor" />
                            <path d="M38 28H29V35H38V28Z" fill="currentColor" />
                            <path d="M53 28H44V35H53V28Z" fill="currentColor" />
                            <path d="M67 28H58V35H67V28Z" fill="currentColor" />
                            <path d="M80 28H71V35H80V28Z" fill="currentColor" />
                            <path d="M95 28H86V35H95V28Z" fill="currentColor" />
                            <path d="M109 28H100V35H109V28Z" fill="currentColor" />
                        </svg>
                    </div>
                </aside>
            </main>
            <Text as={`h1`} className=" absolute bottom-[60px] left-0 -z-10 uppercase md:text-left text-center font-extrabold font-barlow lg:text-[252px] text-[21vw] max-w-[1270px] tracking-[20px] leading-[0.8] opacity-[0.01] shadow-[0px_3px_7px_rgba(0,0,0,0.004)] pointer-events-none">Online</Text>
        </section>
    )
}

export default AboutUs