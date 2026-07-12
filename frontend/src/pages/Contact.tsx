import ContactForm from "../components/contact/ContactForm"
import HeroSection from "../components/contact/HeroSection"
import Map from "../components/contact/Map"
import MaxWrapper from "../components/shared/MaxWrapper"


const Contact = () => {
    return (
        <main className="w-full flex flex-col">
            <HeroSection />
            <MaxWrapper className="w-full px-4 md:px-6 lg:px-8">
                <ContactForm />
                <Map />
            </MaxWrapper>
        </main>
    )
}

export default Contact