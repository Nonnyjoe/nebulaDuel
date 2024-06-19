import { TiArrowSortedDown, TiArrowSortedUp } from "react-icons/ti"
import { Text } from "../atom/Text"
import { Button } from "../atom/Button"


const ContactForm = () => {
    return (
        <section className="w-full h-auto">
            <main className="w-full lg:py-44 md:py-32 py-24 px-6 grid md:grid-cols-2 lg:gap-4 md:gap-8 gap-12">
                <div className="flex flex-col relative">
                    <Text as="h1" className="uppercase lg:text-5xl  text-3xl font-extrabold text-gray-100 mb-7">CONTACT US AND FIND YOUR ANswers</Text>
                    <Text as="p" className="text-gray-400 text-lg text-left font-medium mb-6">Axcepteur sint occaecat atat non proident, sunt culpa officia deserunt mollit anim id est labor umLor emdolor</Text>

                    <Text as="h4" className="flex items-center mb-7">
                        <Text as={`span`} className="text-xl">
                            <TiArrowSortedDown className="rotate-90" />
                        </Text>
                        <Text as={`span`} className="text-xl -ml-2 text-myGreen">
                            <TiArrowSortedUp className="rotate-90" />
                        </Text>
                        <Text as={`span`} className="uppercase text-lg font-bold text-gray-100 ml-3">INFORMATION</Text>
                    </Text>

                    <a href="tel:+971 333 222 557" className="block hover:text-myGreen">+971 333 222 557</a>
                    <a href="mailto:info@exemple.com" className="block hover:text-myGreen">info@exemple.com</a>
                    <Text as={`p`} className="text-lg">New Central Park W7 Street, New York</Text>
                </div>

                <div className="w-full">
                    <form className="w-full ">
                        <div className="w-full grid md:grid-cols-2 gap-4">
                            <div className="relative mt-0 mb-[30px] mx-0 clip-path-polygon-[100%_0,_100%_calc(100%_-_20px),_calc(100%_-_20px)_100%,_0_100%,_0_0] after:content-[''] after:absolute after:bg-[#262f39] after:w-[60px] after:h-px after:right-[-21px] after:-rotate-45 after:bottom-3">
                                <input type="text" name="name" placeholder="Name *" className=" block w-full text-[#fff] transition-all duration-[0.3s] ease-[ease-out] delay-[0s] px-[25px] py-3.5 border-2 border-solid border-[#19222b] bg-transparent placeholder:opacity-80 focus:!border-[#19222b] focus:!ring-0 focus:!ring-[none] focus:border-solid focus:!outline-offset-0  focus:outline-0" required />
                            </div>

                            <div className="relative mt-0 mb-[30px] mx-0 clip-path-polygon-[100%_0,_100%_calc(100%_-_20px),_calc(100%_-_20px)_100%,_0_100%,_0_0] after:content-[''] after:absolute after:bg-[#262f39] after:w-[60px] after:h-px after:right-[-21px] after:-rotate-45 after:bottom-3">
                                <input type="email" name="email" placeholder="Email *" className=" block w-full text-[#fff] transition-all duration-[0.3s] ease-[ease-out] delay-[0s] px-[25px] py-3.5 border-2 border-solid border-[#19222b] bg-transparent placeholder:opacity-80 focus:!border-[#19222b] focus:!ring-0 focus:!ring-[none] focus:border-solid focus:!outline-offset-0  focus:outline-0" required />
                            </div>
                        </div>
                        <div className="relative mt-0 mb-[30px] mx-0 clip-path-polygon-[100%_0,_100%_calc(100%_-_20px),_calc(100%_-_20px)_100%,_0_100%,_0_0] after:content-[''] after:absolute after:bg-[#262f39] after:w-[60px] after:h-px after:right-[-21px] after:-rotate-45 after:bottom-3">
                            <textarea name="message" placeholder="Comment *" className=" h-40 max-h-40 block w-full text-[#fff] transition-all duration-[0.3s] ease-[ease-out] delay-[0s] px-[25px] py-3.5 border-2 border-solid border-[#19222b] bg-transparent placeholder:opacity-80 focus:!border-[#19222b] focus:!ring-0 focus:!outline-[none] focus:!ring-[none] order-solid focus:!outline-offset-0  focus:outline-0"></textarea>
                        </div>
                        <Button type="button" className=" text-[#0f161b] uppercase font-bold tracking-[1px] px-[30px] py-3.5 border-[none] bg-[#45f882]  font-Barlow hover:bg-[#ffbe18] clip-path-polygon-[100%_0,100%_65%,89%_100%,0_100%,0_0]">Submit Now</Button>
                    </form>
                </div>
            </main>
        </section>
    )
}

export default ContactForm