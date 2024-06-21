import Banner from "../components/marketPlace/productId/Banner"
import { useParams } from 'react-router-dom';
import { useEffect } from 'react';
import { animateScroll } from "react-scroll";
import { ScrollToTopOptions } from "../utils/ScrollToTop";
import ProductItem from "../components/marketPlace/productId/ProductItem";
import Related from "../components/marketPlace/productId/Related";

const ProductDetail = () => {

    const { id } = useParams();

    useEffect(() => {
        const scrollToTopOptions: ScrollToTopOptions = {
            duration: 500,
        };
        (animateScroll as { scrollToTop: (options: ScrollToTopOptions) => void }).scrollToTop(scrollToTopOptions);
    }, [id]);

    return (
        <main className="w-full flex flex-col">
            <Banner />
            <ProductItem />
            <Related />
        </main>
    )
}

export default ProductDetail