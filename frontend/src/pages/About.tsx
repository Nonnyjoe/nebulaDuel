import AboutUs from "../components/about/AboutUs"
import HeroSection from "../components/about/HeroSection"
import Services from "../components/about/Services"
import Team from "../components/about/Team"


const About = () => {
    return (
        <main className="w-full flex flex-col">
            <HeroSection />
            <AboutUs />
            <Services />
            <Team />
        </main>
    )
}

export default About