import { ImageWrap } from "../atom/ImageWrap"
import { Text } from "../atom/Text"
import bgImage from "../../assets/img/breadcrumb_bg01.jpg";
import SliderImg from '../../assets/img/breadcrumb_img01.png';
import { Link } from "react-router-dom";

const HeroSection = () => {
    return (
        <section className="bg-center lg:h-[60vh] md:h-[40vh] h-[70vh] w-full bg-cover z-[1] relative after:right-0 before:content-[''] before:absolute before:w-6/12 before:bg-[#45f882] before:h-[50px] before:left-0 before:bottom-0 before:clip-path-polygon-[0_0,_0_100%,_100%_100%] after:content-[''] after:absolute after:w-6/12 after:bg-[#45f882] after:h-[50px] after:left-auto after:bottom-0 after:clip-path-polygon-[100%_0,_0_100%,_100%_100%] xl:before:h-[40px] xl:after:h-[40px] lg:before:h-[30px] lg:after:h-[30px] md:before:h-[30px] md:after:h-[30px] sm:before:h-[20px] sm:after:h-[20px] 
        ">
            {/* banner */}
            <ImageWrap image={bgImage} alt="Banner" className="w-full h-full" objectStatus="object-cover" />

            <main className="w-full h-full absolute top-0 inset-x-0 bg-gradient-to-b from-[#0f161b]/60 z-[10] flex md:flex-row flex-col-reverse lg:px-10 md:px-6 px-4">
                <aside className="flex-1 flex flex-col -mt-10 md:mt-0 justify-center md:items-start items-center lg:gap-4 gap-4 lg:pl-20">

                    <Text as="h1" className="uppercase lg:text-5xl md:text-4xl text-4xl leading-[0.8] font-extrabold font-barlow ">About us</Text>
                    <ul className="flex gap-3 justify-start items-center">
                        <li className="text-myGreen font-medium text-lg tracking-wide font-belanosima">
                            <Link to="/">Home</Link>
                        </li>
                        <li className="w-2 h-2 bg-myGreen rounded-full"></li>
                        <li className="font-medium text-lg tracking-wide font-belanosima">About</li>
                    </ul>

                </aside>
                <aside className="flex-1 flex flex-col justify-end items-center">
                    <ImageWrap image={SliderImg} className="w-[75%] md:w-[80%] lg:w-[65%] xxl:w-[60%] 2xl:w-[60%]" alt="About-Avatar" />
                </aside>
            </main>

        </section>
    )
}

export default HeroSection