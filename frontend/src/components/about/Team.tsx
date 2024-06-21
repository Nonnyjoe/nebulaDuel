import { Text } from "../atom/Text"
import member1 from "../../assets/img/team01.png"
import member2 from "../../assets/img/team02.png"
import member3 from "../../assets/img/team03.png"
import member4 from "../../assets/img/team04.png"
import { useMemo } from "react"
import { ImageWrap } from "../atom/ImageWrap"

type teamMateType = {
    name: string,
    position: string,
    img: string
}

const Team = () => {
    const Images = useMemo(() => [member1, member2, member3, member4], []);

    const teamMates: teamMateType[] = [
        {
            name: "KILLER MASTER",
            position: "Blockchain Expert",
            img: Images[0],
        },
        {
            name: "TANU MARK",
            position: "Devloper",
            img: Images[1]
        },
        {
            name: "THOMPSON SCOT",
            position: "Art Director",
            img: Images[2]
        },
        {
            name: "SHAKH DANIAL",
            position: "Crypto Adviser",
            img: Images[3]
        }
    ]

    return (
        <section className="w-full h-auto bg-navBg">
            <main className="w-full py-32 px-6 flex flex-col items-center gap-4">
                <Text as="h4" className="text-center text-myGreen font-semibold">OUR TEAM MEMBER</Text>
                <Text as="h2" className="font-bold text-center uppercase lg:text-5xl md:text-4xl text-2xl font-barlow">ACTIVE TEAM MEMBERS</Text>
                <div className="w-20 h-1.5 bg-myGreen"></div>

                <section className="w-full h-auto mt-20 grid lg:grid-cols-4 md:grid-cols-2 gap-5">
                    {
                        teamMates.map((item, index) => (
                            <div className="w-full h-auto relative px-[15px]" key={index}>
                                <div
                                    className="text-center border shadow-[0px_3px_13px_0px_rgba(0,0,0,0.17)] relative transition-[0.3s] duration-500 overflow-hidden z-[1] mt-0 mb-[30px] mx-0 pt-[30px] pb-[35px] px-[25px] rounded-xl border-solid border-[#27313f] bg-[#1c242f] before:content-[''] before:absolute before:top-[-60px] before:w-[70px] before:h-80 before:rotate-[-55deg] before:transition-all before:duration-[0.3s] before:ease-[ease-out] before:delay-[0s] before:opacity-[0.55] before:z-[-1] before:left-0 before:bg-[#45f882] after:content-[''] after:absolute after:top-[-60px] after:w-[70px] after:h-80 after:rotate-[55deg] after:transition-all after:duration-[0.3s] after:ease-[ease-out] after:delay-[0s] after:opacity-[0.55] after:z-[-1] after:left-auto after:right-0 after:bg-[#45f882] hover:translate-y-[-7px] hover:before:opacity-[1] hover:after:opacity-[1] group  sm:before:!h-[295px] sm:before:!-top-12 sm:after:!h-[295px] sm:after:!-top-12 xsm:before:!h-[295px] xsm:before:!-top-12 xsm:after:!h-[295px] xsm:after:!-top-12 xsm:m-[0_auto_30px] xsm:max-w-[320px]">
                                    <div
                                        className=" mt-0 mb-[33px] mx-0 after:right-[75px] group-hover:before:opacity-40 group-hover:after:opacity-40 before:content-[''] before:absolute before:top-[-50px] before:w-px before:h-[260px] before:rotate-[-55deg] before:transition-all before:duration-[0.3s] before:ease-[ease-out] before:delay-[0s] before:z-[-1] before:opacity-20 before:left-[75px] before:bg-[#45f882] after:content-[''] after:absolute after:top-[-50px] after:w-px after:h-[260px] after:rotate-[55deg] after:transition-all after:duration-[0.3s] after:ease-[ease-out] after:delay-[0s] after:z-[-1] after:opacity-20 after:left-auto after:bg-[#45f882]">
                                        <ImageWrap className="inline-block" image={item.img} alt="" objectStatus="sm:max-w-full xsm:max-w-full border-[#fff]  max-w-[224px] rounded-[50%] border-[3px] border-solid shadow-[0px_3px_7px_0px_rgba(0,0,0,0.21),inset_0px_3px_9px_0px_rgba(0,0,0,0.92)]" />

                                    </div>
                                    <div className="team__content">
                                        <h4 className="text-[20px] font-extrabold tracking-[1px] mt-0 mb-px mx-0 text-gray-200">{item.name}</h4>
                                        <span
                                            className="block font-semibold text-[16px] text-[#45f882] transition-all duration-[0.3s] ease-[ease-out] delay-[0s] font-Barlow">{item.position}</span>
                                    </div>
                                </div>
                            </div>
                        ))
                    }
                </section>
            </main>
        </section>
    )
}

export default Team



