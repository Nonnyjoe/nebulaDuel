import { Triangle } from "react-loader-spinner"


export const Preloader = () => {
    return (
        <div className="w-full h-screen fixed top-0 left-0 z-[999] bg-bodyBg flex justify-center items-center">
            <Triangle
                visible={true}
                height="80"
                width="80"
                color="#45f882"
                ariaLabel="triangle-loading"
                wrapperStyle={{}}
                wrapperClass=""
            />
        </div>
    )
}