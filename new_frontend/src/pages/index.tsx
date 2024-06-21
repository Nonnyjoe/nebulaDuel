import Creators from "../components/home/Creators"
import HeroSection from "../components/home/HeroSection"
import TopGamers from "../components/home/TopGamers"


const Home = () => {
    return (
        <main className="w-full flex flex-col">
            <HeroSection />
            <Creators />
            <TopGamers />
        </main>
    )
}

export default Home