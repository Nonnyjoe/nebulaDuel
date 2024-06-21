import { Button } from "../atom/Button"
import { Text } from "../atom/Text"
import tab1 from "../../assets/tab/about_tab01.png";
import tab2 from "../../assets/tab/about_tab02.png";
import tab3 from "../../assets/tab/about_tab03.png";
import tab4 from "../../assets/tab/about_tab04.png";
import tab5 from "../../assets/tab/about_tab05.png";
import tab6 from "../../assets/tab/about_tab06.png";
import tabImg1 from "../../assets/tab/about_img01.jpg"
import tabImg2 from "../../assets/tab/about_img02.jpg"
import tabImg3 from "../../assets/tab/about_img03.jpg"
import tabImg4 from "../../assets/tab/about_img04.jpg"
import tabImg5 from "../../assets/tab/about_img05.jpg"
import tabImg6 from "../../assets/tab/about_img06.jpg"
import feature1 from "../../assets/icon/features_icon01.png"
import feature2 from "../../assets/icon/features_icon02.png"
import feature3 from "../../assets/icon/features_icon03.png"
import { useEffect, useState } from "react";
import { ImageWrap } from "../atom/ImageWrap";
import Carousel from "react-multi-carousel";

type tabButtonObj = {
    name: string,
    img: string
}

const tabButton: tabButtonObj[] = [
    {
        name: "tabOne",
        img: tab1,
    }, {
        name: "tabTwo",
        img: tab2
    },
    {
        name: "tabThree",
        img: tab3
    },
    {
        name: "tabFour",
        img: tab4
    },
    {
        name: "tabFive",
        img: tab5
    },
    {
        name: "tabSix",
        img: tab6
    }
]

type tabDataType = {
    tab: string,
    title: string,
    rate: string,
    text: string,
    img: string
}

const tabData: tabDataType[] = [
    {
        tab: "tabOne",
        title: "HUMAN GAME",
        rate: "50%",
        text: "Lorem ipsum dolor sit amet, consteur adipiscing Duis elementum sollicitudin is yaugue euismods Nulla ullamcorper. Morbi pharetra tellus miolslis, tincidunt massa venenatis.",
        img: tabImg1
    },
    {
        tab: "tabTwo",
        title: "AXIE INFINITY",
        rate: "60%",
        text: "Lorem ipsum dolor sit amet, consteur adipiscing Duis elementum sollicitudin is yaugue euismods Nulla ullamcorper. Morbi pharetra tellus miolslis, tincidunt massa venenatis.",
        img: tabImg2
    },
    {
        tab: "tabThree",
        title: "THE WALKING DEAD",
        rate: "75%",
        text: "Lorem ipsum dolor sit amet, consteur adipiscing Duis elementum sollicitudin is yaugue euismods Nulla ullamcorper. Morbi pharetra tellus miolslis, tincidunt massa venenatis.",
        img: tabImg3
    },
    {
        tab: "tabFour",
        title: "THE DOGAMI",
        rate: "65%",
        text: "Lorem ipsum dolor sit amet, consteur adipiscing Duis elementum sollicitudin is yaugue euismods Nulla ullamcorper. Morbi pharetra tellus miolslis, tincidunt massa venenatis.",
        img: tabImg4
    },
    {
        tab: "tabFive",
        title: "THE SANDBOX",
        rate: "75%",
        text: "Lorem ipsum dolor sit amet, consteur adipiscing Duis elementum sollicitudin is yaugue euismods Nulla ullamcorper. Morbi pharetra tellus miolslis, tincidunt massa venenatis.",
        img: tabImg5
    },
    {
        tab: "tabSix",
        title: "PEGAXY HORSES",
        rate: "85%",
        text: "Lorem ipsum dolor sit amet, consteur adipiscing Duis elementum sollicitudin is yaugue euismods Nulla ullamcorper. Morbi pharetra tellus miolslis, tincidunt massa venenatis.",
        img: tabImg6
    }
]

const TopGamers = () => {
    const [activeTab, setActiveTab] = useState<string>(tabButton[0].name)

    const handleFilterClick = (filter: string) => {
        setActiveTab(filter)
    }


    return (
        <section className="w-full bg-cover bg-area bg-[top-center] bg-no-repeat">
            {/* TAB */}
            <main className="md:py-[130px] py-24">
                <div className="container">
                    <div className="flex flex-wrap mx-[-15px]  justify-center ">
                        <div
                            className="w-full relative md:px-[15px] px-6">
                            <div
                                className="text-center mb-[60px] relative after:content-[''] after:block after:bg-myGreen after:w-[65px] after:h-[5px] after:mt-5 after:mb-0 after:mx-auto">
                                <Text as="span"
                                    className="block uppercase text-[14px] tracking-[2px] font-semibold text-[#45f882] leading-none mt-0 mb-[7px] mx-0  sm:mt-0 sm:mb-2.5 sm:mx-0 xsm:mt-0 xsm:mb-2.5 xsm:mx-0">know
                                    about us</Text>
                                <Text as="h3" className=" md:text-[45px] text-center mt-2 text-4xl font-extrabold tracking-[1px] m-0
                            sm:text-[35px] sm:leading-[1.1]
                            xsm:text-[35px] uppercase xsm:leading-[1.1]
                            ">top rated steamers</Text>
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-wrap mx-[-15px]  justify-center ">
                        <div
                            className="w-10/12 basis-10/12 xl:w-10/12 xl:basis-10/12 lg:w-full lg:basis-full md:w-full md:basis-full sm:w-full sm:basis-full xsm:w-full xsm:basis-full relative px-[15px]">
                            <div className="flex items-center flex-wrap justify-center gap-[15px_35px] mt-0 mb-10 mx-0">
                                <Button type="button" className="tg-btn-2">Buy Hero</Button>
                                <Button type="button" className="tg-btn-2 -secondary">Buy Hero</Button>
                            </div>

                            {/* Tab */}
                            <ul className="flex flex-wrap justify-center relative gap-[15px_35px] px-0 py-[22px] before:content-[''] before:absolute before:w-full before:h-px before:left-0 before:top-0 after:content-[''] after:absolute after:w-full after:h-px after:left-0 after:top-auto after:bottom-0 before:bg-gradient-to-r before:from-transparent before:via-[#45f882] before:to-transparent after:bg-gradient-to-r after:from-transparent after:via-[#45f882] after:to-transparent
                            md:gap-[15px_30px]
                            sm:gap-[20px_25px]
                            xsm:gap-[20px_25px]
                            ">
                                {
                                    tabButton.map((tab, index) => (
                                        <li className="relative z-[1]" key={index}>
                                            <Button
                                                onClick={() => handleFilterClick(tab.name)}
                                                className={`relative border transition-all duration-[0.3s] ease-[ease-out] delay-[0s] rounded-[50%] border-solid border-transparent  bg-gradient-to-t from-[#10181f] via-[#e3b17d] to-[#10181f]  hover:bg-gradient-to-t hover:from-[#10181f] hover:via-[#45f882] hover:to-[#10181f] hover:border-transparent group ${activeTab === tab.name ? "via-[#45f882]" : ""}`}
                                            ><Text as="span"
                                                className={`absolute w-[85px] h-[84px] border -translate-x-2/4 -translate-y-2/4 transition-all duration-[0.3s] ease-[ease-out] delay-[0s] z-[-1] rounded-[50%] border-solid border-transparent left-2/4 top-2/4 before:content-[''] before:absolute before:w-full before:h-full before:bg-[#0c1319] before:rounded-[50%] before:left-0 before:top-0 bg-gradient-to-t from-[#10181f] via-[#e3b17d] to-[#10181f]  group-hover:bg-gradient-to-t group-hover:from-[#10181f] group-hover:via-[#45f882] group-hover:to-[#10181f] ${activeTab === tab.name ? "via-[#45f882]" : ""}`}></Text>
                                                <img
                                                    className="bg-[#0c1319] rounded-[50%]"
                                                    src={tab.img} alt={tab.name} /></Button>
                                        </li>
                                    ))
                                }

                            </ul>
                        </div>
                    </div>

                    {/* TAB CONTENT */}
                    <div className="relative md:mx-4 overflow-hidden mt-20 mb-0 after:content-[''] after:absolute after:w-full after:h-px after:opacity-[0.329] after:left-0 after:bottom-0                 
                after:bg-[linear-gradient(45deg,rgba(2,0,36,0)0%,#45f882_100%)]">

                        {
                            tabData.map((tab, index) => (
                                <div className={`md:flex-row flex-col flex-wrap justify-center transition-all duration-200 ${activeTab === tab.tab ? "flex" : "hidden"}`} key={index}>
                                    <ImageWrap
                                        className="w-full xl:w-5/12 lg:w-10/12 md:w-full relative px-[15px]" image={tab.img} alt={tab.title} objectStatus="lg:w-full lg:h-full lg:object-cover lg:mb-[35px] md:w-full md:h-[350px] md:object-cover md:mb-[35px] sm:mb-[35px] xsm:mb-[35px] xsm:h-auto xsm:w-full" />
                                    <div
                                        className="w-full xl:w-7/12 lg:w-10/12 md:w-full  relative px-[15px]">
                                        <div className="w-full flex-wrap flex h-full flex-col">
                                            <section className="w-full grid md:grid-cols-5 gap-3">
                                                <div className="flex flex-col md:col-span-3">
                                                    <Text as="h4" className="uppercase font-bold font-barlow text-[30px] mt-0 mb-0.5 mx-0">{tab.title}</Text>
                                                    <Text as={`span`}
                                                        className="uppercase font-barlow block text-[20px] font-semibold text-[#ffbe18] mt-0 mb-[18px] mx-0 font-Barlow">rate{" "}{tab.rate}</Text>
                                                    <Text as="p" className="m-0">{tab.text}</Text>
                                                </div>
                                                <div className="md:col-span-2">
                                                    <ul className="m-0 p-0 ">
                                                        <li
                                                            className="bg-gradient-to-r from-[#1f2935_0%] via-[transparent_100%] to-[#10181f_100%] shadow-[0px_3px_7px_0px_rgba(0,0,0,0.21)] flex items-center text-[16px] font-bold translate-x-0  transition-[0.3s] duration-500 mt-0 mb-[11px] mx-0 px-[13px] py-[7px] rounded-[7px] hover:-translate-x-2.5 font-Barlow">
                                                            <img className=" mr-[13px]"
                                                                src={feature1} alt="img" /> Chichi
                                                            Dragon Ball
                                                        </li>
                                                        <li
                                                            className="bg-gradient-to-r from-[#1f2935_0%] via-[transparent_100%] to-[#10181f_100%] shadow-[0px_3px_7px_0px_rgba(0,0,0,0.21)] flex items-center text-[16px] font-bold translate-x-0  transition-[0.3s] duration-500 mt-0 mb-[11px] mx-0 px-[13px] py-[7px] rounded-[7px] hover:-translate-x-2.5 font-Barlow">
                                                            <img className="mr-[13px]"
                                                                src={feature2} alt="img" /> Space
                                                            Babe Night
                                                        </li>
                                                        <li
                                                            className="bg-gradient-to-r from-[#1f2935_0%] via-[transparent_100%] to-[#10181f_100%] shadow-[0px_3px_7px_0px_rgba(0,0,0,0.21)] flex items-center text-[16px] font-bold translate-x-0  transition-[0.3s] duration-500 mt-0 mb-[11px] mx-0 px-[13px] py-[7px] rounded-[7px] m-0 hover:-translate-x-2.5 font-Barlow">
                                                            <img className=" mr-[13px]"
                                                                src={feature3} alt="img" /> Dragon
                                                            Ball
                                                        </li>
                                                    </ul>
                                                </div>
                                            </section>
                                            <div className="md:mt-auto mt-3">
                                                <div
                                                    className="w-full grid grid-cols-3 gap-2">
                                                    <a className=" block bg-[#1f2935] bg-[linear-gradient(0deg,#10181f_0%,_transparent_0%,#141a20_100%)] uppercase md:text-[16px] text-[14px] font-bold text-[#adb0bc] text-center tracking-[1px] md:px-[30px] px-[15px] py-[25px] hover:text-[#45f882] font-Barlow" href="">Dragon Ball</a>
                                                    <a className=" block bg-[#1f2935] bg-[linear-gradient(0deg,#10181f_0%,_transparent_0%,#141a20_100%)] uppercase md:text-[16px] text-[14px] font-bold text-[#adb0bc] text-center tracking-[1px] md:px-[30px] px-[15px] py-[25px] hover:text-[#45f882] font-Barlow" href="">nft market</a>
                                                    <a className=" block bg-[#1f2935] bg-[linear-gradient(0deg,#10181f_0%,_transparent_0%,#141a20_100%)] uppercase md:text-[16px] text-[14px] font-bold text-[#adb0bc] text-center tracking-[1px] md:px-[30px] px-[15px] py-[25px] hover:text-[#45f882] font-Barlow" href="">support</a>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        }
                    </div>
                </div>
            </main>
            {/* End of Tab */}

            {/* Slides */}
            <main className="w-full pb-16 overflow-x-hidden">
                <Slides />
            </main>
        </section>
    )
}

export default TopGamers



import gallery1 from "../../assets/gallery/gallery01.jpg"
import gallery2 from "../../assets/gallery/gallery02.jpg"
import gallery3 from "../../assets/gallery/gallery03.jpg"
import gallery4 from "../../assets/gallery/gallery04.jpg"
import gallery5 from "../../assets/gallery/gallery05.jpg"

const Slides = () => {
    const responsive = {
        superLargeDesktop: {
            // the naming can be any, depends on you.
            breakpoint: { max: 4000, min: 3000 },
            items: 3,
        },
        desktop: {
            breakpoint: { max: 3000, min: 1024 },
            items: 1,
        },
        tablet: {
            breakpoint: { max: 1024, min: 464 },
            items: 1,
        },
        mobile: {
            breakpoint: { max: 464, min: 0 },
            items: 1,
        },
    };

    const slideData = [
        {
            img: gallery1,
            title: "DOTA 2 TOURNAMENT",
            rate: "RATE 85%"
        },
        {
            img: gallery2,
            title: "DOTA 2 TOURNAMENT",
            rate: "RATE 85%"
        },
        {
            img: gallery3,
            title: "DOTA 2 TOURNAMENT",
            rate: "RATE 85%"
        },
        {
            img: gallery4,
            title: "DOTA 2 TOURNAMENT",
            rate: "RATE 85%"
        },
        {
            img: gallery5,
            title: "DOTA 2 TOURNAMENT",
            rate: "RATE 85%"
        }
    ]

    const [isCenter, setIsCenter] = useState<boolean>(false);

    useEffect(() => {
        if (window.innerWidth > 380) {
            setIsCenter(true)
        } else {
            setIsCenter(false)
        }
    }, [])


    return (
        <Carousel responsive={responsive} centerMode={isCenter} infinite={true} showDots={true} >
            {
                slideData.map((item, index) => (
                    <div className="w-full flex flex-col gap-4 slide" key={index}>
                        <ImageWrap alt={item.title} image={item.img} className="w-full md:h-[400px] h-[200px] image" objectStatus="object-cover" />
                        <div className="w-full content flex items-center justify-between md:px-8 pb-12">
                            <Text as="h3" className="md:text-xl text-sm font-bold">{item.title}</Text>
                            <Text as="span" className="md:text-base text-xs font-medium text-gray-500">{item.rate}</Text>
                        </div>
                    </div>
                ))
            }

        </Carousel>
    )
}