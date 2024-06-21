import { IoDiamondSharp, IoSettings } from "react-icons/io5"
import { Text } from "../atom/Text"
import { FaEthereum, FaUserCog } from "react-icons/fa"
import Img1 from '../../assets/img/services_img01.jpg';
import Img2 from '../../assets/img/services_img02.jpg';
import Img3 from '../../assets/img/services_img03.jpg';
import Img4 from '../../assets/img/services_img04.jpg';
import Carousel from "react-multi-carousel";
import { useMemo } from "react";
import { ImageWrap } from "../atom/ImageWrap";

const Services = () => {
    const responsive = {
        superLargeDesktop: {
            // the naming can be any, depends on you.
            breakpoint: { max: 4000, min: 3000 },
            items: 1,
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
    const imageList = useMemo(() => [Img1, Img2, Img3, Img4], []);
    return (
        <section className="w-full h-auto bg-bodyBg">
            <main className="w-full py-32 px-6 flex flex-col md:grid md:grid-cols-2 gap-4">
                <div className="w-full flex flex-col items-center md:items-start gap-3">
                    <Text as={`h4`} className="uppercase font-semibold text-center md:text-left text-sm text-myGreen">
                        POWERFUL SERVICES
                    </Text>
                    <Text as={`h1`} className="lg:text-5xl text-center md:text-left font-extrabold tracking-[1px]
                            text-4xl font-barlow">
                        OUR POWERFUL SERVICES DONE ON TIME
                    </Text>
                    <div className="w-20 h-1.5 mt-3 bg-myGreen"></div>

                    <section className="w-full mt-20 grid md:grid-cols-2 gap-x-4 gap-y-12">
                        {
                            list.map((item, index) => (
                                <div key={index} className="flex flex-col items-center md:items-start gap-5">
                                    <div className="flex justify-start text-5xl text-myGreen rounded-full pl-2">
                                        {item.icon}
                                    </div>
                                    <Text as="h3" className="text-gray-100 font-medium text-xl font-belanosima">{item.title}</Text>
                                    <Text as="p" className="text-gray-300 font-barlow text-lg">{item.description}</Text>
                                </div>
                            ))
                        }
                    </section>
                </div>

                <aside className="w-full h-[70vh] hidden md:block">
                    <Carousel
                        responsive={responsive}
                        additionalTransfrom={0}
                        arrows
                        autoPlay
                        autoPlaySpeed={5000}
                        centerMode={false}
                        className=""
                        dotListClass=""
                        draggable
                        focusOnSelect={false}
                        infinite
                        itemClass=""
                        keyBoardControl
                        minimumTouchDrag={80}
                        pauseOnHover
                        renderArrowsWhenDisabled={false}
                        renderButtonGroupOutside={false}
                        renderDotsOutside={false}
                        rewind={false}
                        rewindWithAnimation={false}
                        rtl={false}
                        shouldResetAutoplay
                        showDots={false}
                        sliderClass=""
                        slidesToSlide={1}
                        swipeable>
                        {
                            imageList.map((item, index) => (
                                <ImageWrap key={index} image={item} className="w-full h-full" alt={`Image${index}`} objectStatus="object-cover" />
                            ))
                        }

                    </Carousel>
                </aside>
            </main>
            <aside className="w-full h-[400px] block md:hidden md:h-auto">
                <Carousel
                    responsive={responsive}
                    additionalTransfrom={0}
                    arrows
                    autoPlay
                    autoPlaySpeed={5000}
                    centerMode={false}
                    className=""
                    dotListClass=""
                    draggable
                    focusOnSelect={false}
                    infinite
                    itemClass=""
                    keyBoardControl
                    minimumTouchDrag={80}
                    pauseOnHover
                    renderArrowsWhenDisabled={false}
                    renderButtonGroupOutside={false}
                    renderDotsOutside={false}
                    rewind={false}
                    rewindWithAnimation={false}
                    rtl={false}
                    shouldResetAutoplay
                    showDots={false}
                    sliderClass=""
                    slidesToSlide={1}
                    swipeable>
                    {
                        imageList.map((item, index) => (
                            <ImageWrap key={index} image={item} className="w-full h-full" alt={`Image${index}`} objectStatus="object-cover" />
                        ))
                    }

                </Carousel>
            </aside>
        </section>
    )
}

export default Services

type listType = {
    icon: JSX.Element,
    title: string,
    description: string
}

const list: listType[] = [
    {
        icon: <IoDiamondSharp />,
        title: "Year Experience",
        description: "Lorem ipsum dolor sitamet const adipiscng Duis eletum sollicitudin is yaugue euismods"
    },
    {
        icon: <FaUserCog />,
        title: "Expert Teams",
        description: "Lorem ipsum dolor sitamet const adipiscng Duis eletum sollicitudin is yaugue euismods"
    },
    {
        icon: <FaEthereum />,
        title: "Best NFT Game",
        description: "Lorem ipsum dolor sitamet const adipiscng Duis eletum sollicitudin is yaugue euismods"
    },
    {
        icon: <IoSettings />,
        title: "Worldwide Client",
        description: "Lorem ipsum dolor sitamet const adipiscng Duis eletum sollicitudin is yaugue euismods"
    }
]