import { Link, useParams } from "react-router-dom"
import { ImageWrap } from "../../atom/ImageWrap"
import { Text } from "../../atom/Text"
import bgImg from '../../../assets/img/breadcrumb_bg02.jpg'
import { ListOfProducts } from "../ProductData"

const Banner = () => {
    const { id } = useParams()
    const productId = Number(id);

    const currentProduct = ListOfProducts.filter(item => item.id === productId);

    return (
        <section className="bg-center lg:h-[60vh] md:h-[40vh] h-[70vh] w-full bg-cover z-[1] relative after:right-0 before:content-[''] before:absolute before:w-6/12 before:bg-[#45f882] before:h-[50px] before:left-0 before:bottom-0 before:clip-path-polygon-[0_0,_0_100%,_100%_100%] after:content-[''] after:absolute after:w-6/12 after:bg-[#45f882] after:h-[50px] after:left-auto after:bottom-0 after:clip-path-polygon-[100%_0,_0_100%,_100%_100%] xl:before:h-[40px] xl:after:h-[40px] lg:before:h-[30px] lg:after:h-[30px] md:before:h-[30px] md:after:h-[30px] sm:before:h-[20px] sm:after:h-[20px] 
        ">
            {/* banner */}
            <ImageWrap image={bgImg} alt="Banner" className="w-full h-full" objectStatus="object-cover" />

            <main className="w-full h-full absolute top-0 inset-x-0 bg-gradient-to-b from-[#0f161b]/60 z-[10] flex flex-row justify-center items-center lg:px-10 md:px-6 px-4">
                <aside className="w-full flex flex-col -mt-10 md:mt-0 justify-center items-center lg:gap-4 gap-4">

                    <Text as="h1" className="uppercase lg:text-5xl md:text-4xl text-4xl leading-[0.8] font-extrabold text-center font-barlow ">{currentProduct[0].name}</Text>
                    <ul className="flex gap-3 justify-start items-center">
                        <li className="text-myGreen font-medium text-lg tracking-wide font-belanosima">
                            <Link to="/">Home</Link>
                        </li>
                        <li className="w-2 h-2 bg-myGreen rounded-full"></li>
                        <li className="font-medium text-lg tracking-wide font-belanosima">
                            <Link to="/marketplace">Market Place</Link>
                        </li>
                    </ul>

                </aside>
            </main>

        </section>
    )
}

export default Banner