import { Link } from "react-router-dom";
import { ImageWrap } from "../atom/ImageWrap";
import { Text } from "../atom/Text";
import { ProductType } from "./ProductData";
import { Button } from "../atom/Button";
import { MdOutlineKeyboardDoubleArrowRight } from "react-icons/md";

const ProductList = ({ data }: { data: ProductType[] }) => {
    return (
        <main className="w-full flex-1 flex flex-col gap-4 order-1 md:order-2 ">
            <div className="w-full flex justify-end">
                <Text as='h3' className="text-gray-400 uppercase font-bold font-barlow">SHOWING 1 - {data.length} OF 15 RESULTS</Text>
            </div>
            <section className="w-full grid lg:grid-cols-3 md:grid-cols-2 lg:gap-8 md:gap-5 gap-8">
                {
                    data.map((item) => (
                        <Link to={`/marketplace/${item.id}`} className="w-full rounded-md p-5 border border-myBlack hover:border-gray-500 bg-myBlack" key={item.id}>
                            <div className="w-full flex flex-col gap-4">
                                <ImageWrap image={item.img} alt={item.name} className="w-full h-[250px] overflow-hidden rounded-md" objectStatus="object-cover" />
                                <div className="w-full tinyLine"></div>
                                <div className="w-full flex flex-col gap-1.5">
                                    <div className="w-full flex justify-between items-center">
                                        <Text as='h4' className="text-gray-100 font-bold font-poppins">{item.name}</Text>
                                        <Text as='span' className="text-myGreen font-barlow font-bold">${item.price}</Text>
                                    </div>
                                    <Text as='h4' className="text-xs font-poppins font-medium text-gray-400">{item.category}</Text>
                                </div>
                            </div>
                        </Link>
                    ))
                }

            </section>
            {/* Pagination */}
            <section className="w-full flex justify-center gap-3 items-center mt-8">
                {
                    [...Array(3)].map((_, index) => (
                        <Button type="button" key={index} className="h-14 w-14 bg-navBg text-gray-300 flex justify-center first:bg-myGreen first:text-navBg items-center text-sm font-bold rounded-md border border-gray-800">{`0${index + 1}`}</Button>
                    ))
                }
                <Button type="button" className="h-14 w-14 bg-navBg text-gray-300 flex justify-center items-center text-sm font-bold rounded-md border border-gray-800">...</Button>
                <Button type="button" className="h-14 w-14 bg-navBg text-gray-300 flex justify-center items-center text-sm font-bold rounded-md border border-gray-800"><MdOutlineKeyboardDoubleArrowRight className="text-xl" /></Button>
            </section>
        </main>
    )
}

export default ProductList;