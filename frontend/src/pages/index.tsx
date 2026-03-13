import Creators from "../components/home/Creators"
import HeroSection from "../components/home/HeroSection"
import TopGamers from "../components/home/TopGamers"
import MaxWrapper from "../components/shared/MaxWrapper"


const Home = () => {
    return (
        <main className="w-full flex flex-col">
            <HeroSection />
            <MaxWrapper className="w-full px-4 md:px-6 lg:px-8">
                <Creators />
                <TopGamers />
            </MaxWrapper>
        </main>
    )
}

export default Home