import { Button } from "../atom/Button";
import { Text } from "../atom/Text"
import { FaCaretRight } from "react-icons/fa6";
import { IoSearchOutline } from "react-icons/io5";
import PriceRange from "./PriceRange";
import { ListOfProducts, ProductType } from "./ProductData";
import { useEffect, useMemo, useState } from "react";
import ProductList from "./ProductList";
import { animateScroll } from "react-scroll";

export type ScrollToTopOptions = {
    duration: number;
}

const Container = () => {
    const [data, setData] = useState<ProductType[]>(ListOfProducts);
    const [selectedCategory, setSelectedCategory] = useState<string>('all');

    const categoryCounts = useMemo(() => countCategories(ListOfProducts), []);

    useEffect(() => {
        if (selectedCategory === 'all') {
            setData(ListOfProducts);
        } else {
            setData(ListOfProducts.filter(product => product.category === selectedCategory));
        }
    }, [selectedCategory]);


    const handleFilterByCategory = (selectedCategory: string) => {
        setSelectedCategory(selectedCategory);
        scrollUp();
    };

    const scrollUp = () => {
        const scrollToTopOptions: ScrollToTopOptions = {
            duration: 500,
        };
        (animateScroll as { scrollToTop: (options: ScrollToTopOptions) => void }).scrollToTop(scrollToTopOptions);
    }

    return (
        <section className="w-full lg:my-32 my-20 flex md:flex-row flex-col gap-8 lg:px-8 md:px-6 px-4">
            <aside className="lg:w-[22%] md:w-[28%] w-full order-2 md:order-1 flex flex-col gap-8 mt-10 ">
                {/* search */}
                <div className="w-full grid grid-rows-2 border border-gray-500/60 h-28 rounded-md overflow-hidden">
                    <Text as={`h3`} className="w-full flex font-barlow pl-3 font-bold text-lg text-gray-100 gap-1 items-center uppercase"><FaCaretRight className=" text-myGreen" />Search</Text>
                    <form className="w-full relative border-t border-gray-500/60 bg-myBlack">
                        <input type="text" className="w-full h-full bg-transparent border-none outline-none text-gray-300 text-lg pl-4 pr-12" placeholder="Search" />
                        <Button type="submit" className="text-gray-300 text-xl p-3 absolute top-1.5 right-1"><IoSearchOutline /></Button>
                    </form>
                </div>

                {/* price filter */}
                <div className="w-full grid grid-rows-5 border border-gray-500/60 h-40 rounded-md overflow-hidden">
                    <Text as={`h3`} className="w-full row-span-2 flex font-barlow pl-3 font-bold text-lg text-gray-100 gap-1 uppercase items-center"><FaCaretRight className=" text-myGreen" />Filter by price</Text>
                    <div className="w-full row-span-3 flex flex-col justify-center items-center p-4 border-t border-gray-500/60 bg-myBlack">
                        <PriceRange />
                    </div>
                </div>

                {/* category */}
                <div className="w-full border border-gray-500/60 rounded-md overflow-hidden">
                    <Text as={`h3`} className="w-full flex font-barlow pl-3 py-5 font-bold text-lg text-gray-100 gap-1 uppercase items-center"><FaCaretRight className=" text-myGreen" />categories</Text>
                    <div className="w-full flex flex-col justify-center items-center border-t border-gray-500/60 bg-myBlack">
                        <ul className="w-full list-none">
                            <li key={'all'} className="w-full flex justify-between border-b border-gray-500/60 cursor-pointer py-4 px-5 items-center gap-2 last:border-none hover:bg-gray-700" onClick={() => handleFilterByCategory('all')}>
                                <Text as="span" className="text-gray-200 font-semibold uppercase">All</Text>
                            </li>
                            {Object.keys(categoryCounts).map((category) => (
                                <li key={category} className="w-full flex justify-between border-b border-gray-500/60 cursor-pointer py-4 px-5 items-center gap-2 last:border-none hover:bg-gray-700" onClick={() => handleFilterByCategory(category)}>
                                    <Text as="span" className="text-gray-200 font-semibold uppercase">{category}</Text>
                                    <Text as="span" className="text-gray-300">{categoryCounts[category]}</Text>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </aside>

            {/* list of products */}
            <ProductList data={data} />
        </section>
    )
}

export default Container


const countCategories = (products: ProductType[]) => {
    const categoryCount: { [key: string]: number } = {};

    products.forEach((product) => {
        if (categoryCount[product.category]) {
            categoryCount[product.category]++;
        } else {
            categoryCount[product.category] = 1;
        }
    });

    return categoryCount;
};