import { useNavigate } from "react-router"
import Error404Img from "../assets/img/404page.png";
import { IoCaretBack } from "react-icons/io5";
import { Button } from "../components/atom/Button";


const PageNotFound = () => {
    const navigate = useNavigate()
    return (
        <section className="w-full h-screen fixed top-0 left-0 flex flex-col justify-center items-center bg-bodyBg overflow-hidden z-[99999]">
            <div className="md:w-[600px] w-[90%] -mt-20 md:-mt-30 lg:-mt-10">
                <img src={Error404Img} className="w-full h-full object-contain" alt="Page Not Found Image" />
            </div>

            <Button type="button" className="bg-myGreen text-gray-900 px-6 py-3 rounded-md capitalize hover:bg-myYellow flex items-center gap-1" onClick={() => navigate(-1)}>
                <IoCaretBack className="text-xl" />
                Go back
            </Button>

        </section>
    )
}

export default PageNotFound