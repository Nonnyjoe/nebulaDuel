/* eslint-disable @typescript-eslint/no-unused-vars */
import { useEffect, useRef, useState } from "react";
import { Text } from "../atom/Text";


const PriceRange = () => {

    const [minPrice, setMinPrice] = useState<number>(80);
    const [maxPrice, setMaxPrice] = useState<number>(415);
    const minPriceRef = useRef<HTMLDivElement>(null);
    const maxPriceRef = useRef<HTMLDivElement>(null);
    const rangeRef = useRef<HTMLDivElement>(null);
    const sliderRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const updateRange = () => {
            if (minPriceRef.current && maxPriceRef.current && rangeRef.current) {
                const minPercent = (minPrice / 500) * 100;
                const maxPercent = (maxPrice / 500) * 100;
                minPriceRef.current.style.left = `${minPercent}%`;
                maxPriceRef.current.style.left = `${maxPercent - 2}%`;
                rangeRef.current.style.left = `${minPercent}%`;
                rangeRef.current.style.right = `${100 - maxPercent}%`;
            }
        };
        updateRange();
    }, [minPrice, maxPrice]);



    const handleMouseDown = (handle: 'min' | 'max') => (e: React.MouseEvent) => {
        console.log(e);
        const onMouseMove = (e: MouseEvent) => {
            if (!sliderRef.current) return;

            const sliderRect = sliderRef.current.getBoundingClientRect();
            const newPercent = ((e.clientX - sliderRect.left) / sliderRect.width) * 100;
            let newValue = Math.round((newPercent / 100) * 500);

            if (handle === 'min') {
                newValue = Math.max(0, Math.min(newValue, maxPrice - 1));
                setMinPrice(newValue);
            } else {
                newValue = Math.max(minPrice + 1, Math.min(newValue, 500));
                setMaxPrice(newValue);
            }
        };

        const onMouseUp = () => {
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        };

        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    };

    return (
        <>
            <div className="relative w-full h-6 mt-2" ref={sliderRef}>
                <div className="absolute h-2 w-full bg-gray-700 rounded-lg" />
                <div
                    ref={rangeRef}
                    className="absolute h-2 bg-green-500 rounded-lg"
                />
                <div
                    ref={minPriceRef}
                    className="absolute w-4 h-4 bg-green-500 rounded-full cursor-pointer -top-1"
                    onMouseDown={handleMouseDown('min')}
                />
                <div
                    ref={maxPriceRef}
                    className="absolute w-4 h-4 bg-green-500 rounded-full cursor-pointer -top-1"
                    onMouseDown={handleMouseDown('max')}
                />
            </div>
            <div className="w-full flex justify-between ">
                <Text as="span" className="text-gray-200 font-barlow font-bold">FILTER</Text>
                <Text as="span" className="text-gray-400 font-barlow font-medium tracking-widest">{`$${minPrice} - $${maxPrice}`}</Text>
            </div>
        </>

    )
}

export default PriceRange