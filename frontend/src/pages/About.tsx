import AboutUs from "../components/about/AboutUs"
import HeroSection from "../components/about/HeroSection"
import Services from "../components/about/Services"
import Team from "../components/about/Team"
import MaxWrapper from "../components/shared/MaxWrapper"


const About = () => {
    return (
        <main className="w-full flex flex-col">
            <HeroSection />
            <MaxWrapper className="w-full px-4 md:px-6 lg:px-8">
                <AboutUs />
                <Services />
                <Team />
            </MaxWrapper>
        </main>
    )
}

export default About