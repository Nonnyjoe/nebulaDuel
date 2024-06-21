import ContactForm from "../components/contact/ContactForm"
import HeroSection from "../components/contact/HeroSection"
import Map from "../components/contact/Map"


const Contact = () => {
    return (
        <main className="w-full flex flex-col">
            <HeroSection />
            <ContactForm />
            <Map />
        </main>
    )
}

export default Contact