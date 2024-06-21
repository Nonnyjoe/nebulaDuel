import { Link, useParams } from "react-router-dom";
import { ImageWrap } from "../../atom/ImageWrap"
import { ListOfProducts } from "../ProductData";
import { Text } from "../../atom/Text";
import { Button } from "../../atom/Button";
import { FaCaretDown, FaCaretUp } from "react-icons/fa";
import { FormEvent, useState } from "react";
import { RiFacebookFill } from "react-icons/ri";
import { IoLogoTwitter } from "react-icons/io5";
import { AiFillInstagram } from "react-icons/ai";
import { IoIosStar } from "react-icons/io";


const ProductItem = () => {
    const [quantity, setQuantity] = useState<number>(1)

    const handleIncrement = () => {
        setQuantity(prev => prev + 1);
    }
    const handleDecrement = () => {
        setQuantity(prev => prev === 1 ? 1 : prev - 1);
    }

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault()
    }

    const { id } = useParams()
    const productId = Number(id);

    const currentProduct = ListOfProducts.filter(item => item.id === productId);

    return (
        <section className="w-full flex flex-col lg:my-32 my-20 lg:px-24 md:px-6 px-4">
            <section className="w-full flex md:flex-row items-start flex-col gap-8">
                <main className="w-full bg-myBlack p-5 rounded-md flex-1">
                    <ImageWrap image={currentProduct[0].img} alt={currentProduct[0].name} className="w-full lg:h-[450px] h-[300px]" objectStatus="object-cover" />
                </main>
                <main className="w-full flex flex-col gap-2 flex-1">
                    <div className="flex items-center gap-2">
                        {
                            [...Array(currentProduct[0].rates)].map((_, index) => (
                                <Text as='span' className=" text-amber-500" key={index}>
                                    <IoIosStar />
                                </Text>
                            ))
                        }
                        <Text as='small' className="text-gray-400 tracking-wider">(Ratings)</Text>
                    </div>
                    <Text as='h1' className="text-gray-100 my-2 lg:text-4xl md:text-3xl text-2xl uppercase font-bold font-poppins">{currentProduct[0].name}</Text>
                    <Text as="h4" className="flex items-center text-gray-100 font-bold text-lg gap-2">
                        ${currentProduct[0].price}
                        <Text as="span" className="text-myGreen uppercase">
                            - {currentProduct[0].isInStock ? "In Stock" : "Out Stock"}
                        </Text>
                    </Text>
                    <Text as="p" className="text-gray-400 font-medium my-4 font-poppins">{currentProduct[0].briefDesc}</Text>
                    <div className="w-full flex items-center gap-3 mb-4">
                        <Text as="span" className="text-gray-200 font-poppins font-semibold">Model:</Text>
                        <article className="w-full flex items-center gap-3">
                            {
                                currentProduct[0].model.map((item) => (
                                    <Button key={item} type="button" className="py-2 px-6 font-medium rounded-sm text-sm first:bg-amber-500 first:text-navBg bg-myBlack text-gray-300">{item}</Button>
                                ))
                            }
                        </article>
                    </div>
                    <div className="w-full tinyLine mb-4"></div>
                    <form className="w-full flex gap-4 items-stretch" onSubmit={handleSubmit}>
                        <div className="lg:w-[20%] w-[30%] relative">
                            <input type="number" name="name" value={quantity} onChange={e => setQuantity(Number(e.target.value))} className="block w-full text-[#fff] transition-all duration-[0.3s] ease-[ease-out] delay-[0s] px-[25px] py-3.5 border-2 border-solid border-[#19222b] bg-transparent placeholder:opacity-80 focus:!border-[#19222b] focus:!ring-0 focus:!ring-[none] focus:border-solid focus:!outline-offset-0  focus:outline-0" required />
                            <div className="flex flex-col gap-1 absolute top-2.5 right-3">
                                <Button type="button" onClick={handleIncrement} className="text-gray-200">
                                    <FaCaretUp />
                                </Button>
                                <Button type="button" onClick={handleDecrement} className="text-gray-200">
                                    <FaCaretDown />
                                </Button>
                            </div>
                        </div>
                        <Button type="submit" className="text-[#0f161b] uppercase font-bold tracking-[1px] px-[30px] py-3.5 border-[none] bg-[#45f882]  font-Barlow hover:bg-[#ffbe18] clip-path-polygon-[100%_0,100%_65%,89%_100%,0_100%,0_0]">Add to Cart</Button>
                    </form>
                    <div className="w-full flex items-center gap-3 mt-3">
                        <Text as="span" className="text-gray-200 font-medium font-poppins">Categories:</Text>
                        <article className="w-full flex items-center gap-3">
                            {
                                currentProduct[0].itemCategories.map((item) => (
                                    <Text as='span' key={item} className="text-gray-400">{item},</Text>
                                ))
                            }
                        </article>
                    </div>
                    <div className="w-full flex items-center gap-3 my-2.5">
                        <Text as="span" className="text-gray-200 font-medium font-poppins">Tags:</Text>
                        <article className="w-full flex items-center gap-3">
                            {
                                currentProduct[0].tags.map((item) => (
                                    <Text as='span' key={item} className="text-gray-400">{item},</Text>
                                ))
                            }
                        </article>
                    </div>
                    <div className="w-full flex items-center gap-3">
                        <Text as="span" className="text-gray-200 font-medium font-poppins">Share:</Text>
                        <article className="w-full flex items-center gap-3">
                            <Link to={`/marketplace/${currentProduct[0].id}`} className="text-xl">
                                <RiFacebookFill />
                            </Link>
                            <Link to={`/marketplace/${currentProduct[0].id}`} className="text-xl">
                                <IoLogoTwitter />
                            </Link>
                            <Link to={`/marketplace/${currentProduct[0].id}`} className="text-xl">
                                <AiFillInstagram />
                            </Link>
                        </article>
                    </div>
                </main>
            </section>

            <main className="flex flex-col items-start mt-12">
                {/* Desc */}
                <Text as="h3" className="py-4 px-8  bg-navBg text-gray-100 rounded-md uppercase font-poppins font-bold">Description</Text>
                <Text as="p" className="p-5 text-gray-400 bg-navBg">{currentProduct[0].desc}</Text>

                {/* additional Info */}
                <Text as="h3" className="py-4 px-8 mt-8 bg-navBg text-gray-100 rounded-md uppercase font-poppins font-bold">Additional Information</Text>
                <div className="p-5 w-full text-gray-400 bg-navBg">
                    <table className="table-auto w-full rounded-md border-collapse border border-gray-700">
                        <tr>
                            <th className="py-4 border border-gray-700">General</th>
                            <td className="py-4 border border-gray-700 px-5">{currentProduct[0].additionalInfo.general}</td>
                        </tr>
                        <tr>
                            <th className="py-4 border border-gray-700">Technical Info</th>
                            <td className="py-4 border border-gray-700 px-5">{currentProduct[0].additionalInfo.technicalInfo}</td>
                        </tr>
                        <tr>
                            <th className="py-4 border border-gray-700">Display</th>
                            <td className="py-4 border border-gray-700 px-5">{currentProduct[0].additionalInfo.display}</td>
                        </tr>
                        <tr>
                            <th className="py-4 border border-gray-700">RAM & Storage</th>
                            <td className="py-4 border border-gray-700 px-5">{currentProduct[0].additionalInfo.ramAndStorage}</td>
                        </tr>
                        <tr>
                            <th className="py-4 border border-gray-700">Included</th>
                            <td className="py-4 border border-gray-700 px-5">{currentProduct[0].additionalInfo.included}</td>
                        </tr>
                    </table>
                </div>
            </main>
        </section>
    )
}

export default ProductItem