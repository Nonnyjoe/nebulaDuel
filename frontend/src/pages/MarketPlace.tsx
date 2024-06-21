import Container from "../components/marketPlace/Container"
import HeroSection from "../components/marketPlace/HeroSection"


const MarketPlace = () => {
    return (
        <main className="w-full flex flex-col">
            <HeroSection />
            <Container />
        </main>
    )
}

export default MarketPlace