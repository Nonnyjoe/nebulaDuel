import { useEffect, useState } from "react";
import { Button } from "../atom/Button";
import { MdDoubleArrow } from "react-icons/md";


const ScrollButton = () => {

    const [isVisible, setIsVisible] = useState(false);

    // Show button when user scrolls down 200px
    useEffect(() => {
        const toggleVisibility = () => {
            if (window.scrollY > 200) {
                setIsVisible(true);
            } else {
                setIsVisible(false);
            }
        };

        window.addEventListener('scroll', toggleVisibility);

        return () => {
            window.removeEventListener('scroll', toggleVisibility);
        };
    }, []);

    // Scroll to top when button is clicked
    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };

    return (
        <div className="fixed bottom-8 right-8 z-[99]">
            {
                isVisible && (<Button type="button" onClick={scrollToTop} className="px-3.5 py-3.5 bg-myGreen duration-200 transition-all hover:bg-myYellow text-myBlack md:text-2xl text-base rounded-[3px]">
                    <MdDoubleArrow className=" -rotate-90" />
                </Button>)
            }
        </div>


    )
}

export default ScrollButton