import Container from "../components/marketPlace/Container"
import HeroSection from "../components/marketPlace/HeroSection"
import MaxWrapper from "../components/shared/MaxWrapper"


const MarketPlace = () => {
    return (
        <main className="w-full flex flex-col">
            <HeroSection />
            <MaxWrapper className="w-full px-4 md:px-6 lg:px-8">
                <Container />
            </MaxWrapper>
        </main>
    )
}

export default MarketPlace