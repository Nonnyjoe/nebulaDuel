import Banner from "../components/marketPlace/productId/Banner"
import { useParams } from 'react-router-dom';
import { useEffect } from 'react';
import { animateScroll } from "react-scroll";
import { ScrollToTopOptions } from "../utils/ScrollToTop";
import ProductItem from "../components/marketPlace/productId/ProductItem";
import Related from "../components/marketPlace/productId/Related";
import MaxWrapper from "../components/shared/MaxWrapper";

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
            <MaxWrapper className="w-full px-4 md:px-6 lg:px-8">
                <ProductItem />
                <Related />
            </MaxWrapper>
        </main>
    )
}

export default ProductDetail