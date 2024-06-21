import { Text } from "../atom/Text"
import userImg from "../../assets/img/team01.png"
import { ImageWrap } from "../atom/ImageWrap"
import { Button } from "../atom/Button"

const UserProfile = () => {
    return (
        <section className="w-full h-auto bg-bodyBg">
            <main className="w-full lg:py-32 md:py-24 py-20 px-6 flex flex-col items-center gap-4">
                <Text as="h2" className="font-bold text-center uppercase lg:text-5xl md:text-4xl text-2xl font-barlow">Create your profile</Text>
                <Text as="p" className="font-bold text-center text-lg text-gray-400 font-barlow">Are you ready to be a Gamer? Create your profile and let's get started</Text>
                <div className="w-20 h-1.5 bg-myGreen"></div>


                <section className="lg:w-[70%] w-full md:mt-20 mt-12 grid md:grid-cols-2 gap-4">

                    <div className="w-full h-auto relative lg:px-12 px-3">
                        <div
                            className="text-center border shadow-[0px_3px_13px_0px_rgba(0,0,0,0.17)] relative transition-[0.3s] duration-500 overflow-hidden z-[1] mt-0 mb-[30px] mx-0 pt-[30px] pb-[35px] px-[25px] rounded-xl border-solid border-[#27313f] bg-[#1c242f] before:content-[''] before:absolute before:top-[-60px] before:w-[70px] before:h-80 before:rotate-[-55deg] before:transition-all before:duration-[0.3s] before:ease-[ease-out] before:delay-[0s] before:opacity-[0.55] before:z-[-1] before:left-0 before:bg-[#45f882] after:content-[''] after:absolute after:top-[-60px] after:w-[70px] after:h-80 after:rotate-[55deg] after:transition-all after:duration-[0.3s] after:ease-[ease-out] after:delay-[0s] after:opacity-[0.55] after:z-[-1] after:left-auto after:right-0 after:bg-[#45f882] hover:translate-y-[-7px] hover:before:opacity-[1] hover:after:opacity-[1] group  sm:before:!h-[295px] sm:before:!-top-12 sm:after:!h-[295px] sm:after:!-top-12 xsm:before:!h-[295px] xsm:before:!-top-12 xsm:after:!h-[295px] xsm:after:!-top-12 xsm:m-[0_auto_30px] xsm:max-w-[320px]">
                            <div
                                className=" mt-0 mb-[33px] mx-0 after:right-[75px] group-hover:before:opacity-40 group-hover:after:opacity-40 before:content-[''] before:absolute before:top-[-50px] before:w-px before:h-[260px] before:rotate-[-55deg] before:transition-all before:duration-[0.3s] before:ease-[ease-out] before:delay-[0s] before:z-[-1] before:opacity-20 before:left-[75px] before:bg-[#45f882] after:content-[''] after:absolute after:top-[-50px] after:w-px after:h-[260px] after:rotate-[55deg] after:transition-all after:duration-[0.3s] after:ease-[ease-out] after:delay-[0s] after:z-[-1] after:opacity-20 after:left-auto after:bg-[#45f882]">
                                <ImageWrap className="inline-block" image={userImg} alt="" objectStatus="sm:max-w-full xsm:max-w-full border-[#fff]  max-w-[224px] rounded-[50%] border-[3px] border-solid shadow-[0px_3px_7px_0px_rgba(0,0,0,0.21),inset_0px_3px_9px_0px_rgba(0,0,0,0.92)]" />

                            </div>
                            <div className="team__content">
                                <h4 className="text-[20px] font-extrabold tracking-[1px] mt-0 mb-px mx-0 text-gray-200">KILLER MASTER</h4>
                                <span
                                    className="block font-semibold text-[16px] text-[#45f882] transition-all duration-[0.3s] ease-[ease-out] delay-[0s] font-Barlow">Player</span>
                            </div>
                            <div className="mt-4 flex flex-col gap-1">
                                <Text as="p" className="text-gray-400 text-base font-belanosima">No of Characters: <Text as="span" className="text-myGreen/70 font-poppins">3</Text>
                                </Text>
                                <Text as="p" className="text-gray-400 text-base font-belanosima">Game Points: <Text as="span" className="text-myGreen/70 font-poppins">250 pts</Text>
                                </Text>
                                <Text as="p" className="text-gray-400 text-base font-belanosima">Nebula Balance: <Text as="span" className="text-myGreen/70 font-poppins">0 $Neb</Text>
                                </Text>
                            </div>
                        </div>
                    </div>

                    <aside>
                        <form className="w-full ">

                            <div className="relative mt-0 mb-[30px] mx-0 clip-path-polygon-[100%_0,_100%_calc(100%_-_20px),_calc(100%_-_20px)_100%,_0_100%,_0_0] after:content-[''] after:absolute after:bg-[#262f39] after:w-[60px] after:h-px after:right-[-21px] after:-rotate-45 after:bottom-3">
                                <label htmlFor="name" className="text-gray-400 font-belanosima">Name</label>
                                <input type="text" name="name" placeholder="Enter your name *" className=" block w-full text-[#fff] transition-all duration-[0.3s] ease-[ease-out] delay-[0s] px-[25px] py-3.5 border-2 border-solid border-[#19222b] bg-transparent placeholder:opacity-80 focus:!border-[#19222b] focus:!ring-0 focus:!ring-[none] focus:border-solid focus:!outline-offset-0  focus:outline-0" required />
                            </div>

                            <div className="relative mt-0 mb-[30px] mx-0 clip-path-polygon-[100%_0,_100%_calc(100%_-_20px),_calc(100%_-_20px)_100%,_0_100%,_0_0] after:content-[''] after:absolute after:bg-[#262f39] after:w-[60px] after:h-px after:right-[-21px] after:-rotate-45 after:bottom-3">
                                <label htmlFor="profile" className="text-gray-400 font-belanosima">Upload Avatar</label>
                                <input type="file" name="profile" placeholder="Upload avatar *" className=" block w-full text-[#fff] transition-all duration-[0.3s] ease-[ease-out] delay-[0s] px-[25px] py-3.5 border-2 border-solid border-[#19222b] bg-transparent placeholder:opacity-80 focus:!border-[#19222b] focus:!ring-0 focus:!ring-[none] focus:border-solid focus:!outline-offset-0  focus:outline-0" required />
                            </div>
                            <Button type="button" className=" text-[#0f161b] uppercase font-bold tracking-[1px] px-[30px] py-3.5 border-[none] bg-[#45f882]  font-Barlow hover:bg-[#ffbe18] clip-path-polygon-[100%_0,100%_65%,89%_100%,0_100%,0_0]">Submit Now</Button>
                        </form>
                    </aside>
                </section>

            </main>

        </section>
    )
}

export default UserProfile