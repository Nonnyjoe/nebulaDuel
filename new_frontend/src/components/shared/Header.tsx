import { Link, useLocation } from "react-router-dom"
import { ImageWrap } from "../atom/ImageWrap"
import Logo from "../../assets/logo/logo.png";
import { NavLinks } from "../../data/ContentData";
import { FiSearch } from "react-icons/fi";
import { Button } from "../atom/Button";
import { GiCrossedSwords } from "react-icons/gi";
import { useEffect, useRef, useState } from "react";
import { Text } from "../atom/Text";
import { IoMdMenu } from "react-icons/io";


const Header = () => {

    const { pathname } = useLocation();

    const [openSearch, setOpenSearch] = useState(false);

    const [openMenu, setOpenMenu] = useState(false);


    const handleToggle = () => {
        setOpenMenu(!openMenu);
    }

    useEffect(() => {
        if (openMenu) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }
    })

    const handleSearchClick = () => {
        setOpenSearch(!openSearch);
    }

    const [isNavVisible, setNavIsVisible] = useState(false);

    useEffect(() => {
        const toggleNavVisibility = () => {
            if (window.scrollY > 200) {
                setNavIsVisible(true);
            } else {
                setNavIsVisible(false);
            }
        };

        window.addEventListener('scroll', toggleNavVisibility);

        return () => {
            window.removeEventListener('scroll', toggleNavVisibility);
        };
    }, []);

    return (
        <header className={`w-full h-auto  ${isNavVisible ? "sticky top-0 left-0 z-[80] bg-navBg" : "static"}`}>
            <div className="w-full relative bg-navBg flex justify-between items-center py-4 md:px-8 px-3">
                <Link to='/'>
                    <ImageWrap className="md:w-[180px] w-[130px]" objectStatus="object-cover" alt="logo" image={Logo} />
                </Link>

                <ul className="lg:flex hidden items-center gap-8">
                    {
                        NavLinks.map(({ name, path, dropdown }, index) => (
                            <li className="block relative list-none group" key={index}>
                                <Link
                                    className={`text-sm font-bold uppercase text-gray-100 block leading-none relative tracking-[0.8px] z-[1] font-barlow before:content-[''] before:absolute before:w-[42px] before:h-px before:-translate-y-2/4 before:rotate-0 before:opacity-0 before:transition-all before:duration-[0.3s] before:ease-[ease-out] before:delay-[0s] before:mx-auto before:my-0 before:top-2/4 before:inset-x-0 before:bg-myGreen group-hover:text-myGreen  group-hover:before:opacity-100 group-hover:before:-translate-y-2/4 group-hover:before:rotate-[-40deg] ${pathname === path && "text-myGreen before:opacity-100 before:-translate-y-2/4 before:rotate-[-40deg]"}`}
                                    to={path ? path : pathname}
                                >
                                    {name}
                                </Link>
                                {
                                    dropdown && (
                                        <ul className="dropdown-menu absolute z-10 -left-3 mt-3 w-48 bg-navBg border-b border-gray-800 rounded-md shadow-lg py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible">
                                            {dropdown.map(({ path, name }, idx) => (
                                                <li key={idx}>
                                                    <Link to={path} className="block px-4 py-2 text-gray-200 hover:text-myGreen">{name}</Link>
                                                </li>
                                            ))}
                                        </ul>
                                    )
                                }
                            </li>
                        ))
                    }
                </ul>

                <aside className="flex items-center lg:gap-6 gap-2">
                    <Button className="text-gray-100 lg:flex hidden text-xl font-bold hover:text-myGreen" type="button" >
                        <FiSearch onClick={handleSearchClick} />
                    </Button>
                    <Button className="tg-border-btn text-gray-100 text-[0.7rem] font-bold font-barlow px-4 py-2 flex justify-center items-center">
                        Connect Wallet
                    </Button>
                    <Button className="lg:hidden flex text-3xl border-2 p-1 border-myGreen font-bold text-myGreen" type="button">
                        <IoMdMenu onClick={handleToggle} />
                    </Button>
                </aside>
                <Search openSearch={openSearch} setOpenSearch={setOpenSearch} handleSearch={handleSearchClick} />

                {/* Mobile */}
                <div className={`fixed top-0 z-[99] w-full h-screen bg-bodyBg/50 transition-all duration-[500ms] ease-[cubic-bezier(0.86,0,0.07,1)] lg:hidden flex justify-end ${openMenu ? "left-0" : "left-[100%]"}`}>
                    <div className={`w-[80%] h-full bg-bodyBg border-l-2 border-myGreen/10 flex flex-col gap-10 transition-all duration-[500ms] ease-[cubic-bezier(0.86,0,0.07,1)] px-6 py-8 delay-300 ${openMenu ? "translate-x-0" : "translate-x-full"}`}>
                        <header className="flex justify-between items-center w-full">
                            <Link to='/'>
                                <ImageWrap className="md:w-[180px] w-[130px]" objectStatus="object-cover" alt="logo" image={Logo} />
                            </Link>
                            <Button type="button" className="text-2xl text-myGreen">
                                <GiCrossedSwords onClick={handleToggle} />
                            </Button>
                        </header>

                        <form className="relative w-full">
                            <input type="text" placeholder="Search here..." className=" block w-full text-[14px] h-[45px] text-[#fff] pl-5 pr-[45px] py-2.5 border-none bg-[#182029] outline-none placeholder:text-[14px] placeholder:text-[#c7c7c7]
                                        focus:!ring-[none] focus:!border-none
                                        "/>
                            <Button type="submit"
                                className="absolute -translate-y-2/4 leading-none text-[#fff] p-0 border-[none] right-5 top-2/4 bg-transparent">
                                <FiSearch />
                            </Button>
                        </form>
                        <ul className="flex flex-col lg:hidden mt-6 items-start gap-6">
                            {
                                NavLinks.map(({ name, path, dropdown }, index) => (
                                    <li className="block relative list-none group" key={index}>
                                        <Link
                                            className={`text-sm font-bold uppercase text-gray-100 block leading-none relative tracking-[0.8px] z-[1] font-barlow before:content-[''] before:absolute before:w-[7px] before:h-[7px]
                                            before:rounded-full before:opacity-0 before:transition-all before:duration-[0.3s] before:ease-[ease-out] before:delay-[0s]  before:top-1 before:-left-3 before:bg-myGreen group-hover:text-myGreen  group-hover:before:opacity-100 ${pathname === path && "text-myGreen before:opacity-100"}`}
                                            to={path ? path : pathname}
                                        >
                                            {name}
                                        </Link>
                                        {
                                            dropdown && (
                                                <ul className="mt-2 bg-bodyBg  py-2 ">
                                                    {dropdown.map((item, idx) => (
                                                        <li key={idx}>
                                                            <Link to={item.path} className="block px-2 py-1 text-gray-400 text-sm uppercase font-medium hover:text-myGreen">{item.name}</Link>
                                                        </li>
                                                    ))}
                                                </ul>
                                            )
                                        }
                                    </li>
                                ))
                            }
                        </ul>
                    </div>
                </div>
            </div>
        </header>
    )
}

export default Header

type SearchTypes = {
    openSearch: boolean,
    setOpenSearch?: React.Dispatch<React.SetStateAction<boolean>>,
    handleSearch?: () => void
}

export const Search = ({ openSearch, handleSearch }: SearchTypes) => {

    const search = useRef<HTMLInputElement>(null)

    useEffect(() => {
        if (openSearch) {
            document.body.style.overflow = 'hidden';
            search.current?.focus();
        } else {
            document.body.style.overflow = 'unset';
        }
    }, [openSearch])

    return (
        <div
            className={`fixed h-screen w-full z-[90] top-0 transition-all duration-[1500ms] ease-[cubic-bezier(0.86,0,0.07,1)] left-0 flex flex-col justify-center items-center  after:content-[''] after:absolute after:w-full after:h-[370px] searchWave after:bg-no-repeat after:bg-center after:bg-cover after:mt-0 after:left-0 after:bottom-0 after:z-10 ${openSearch ? " translate-y-0" : " -translate-y-full"}`}>
            <div
                className="content-[''] absolute h-screen w-full bg-[rgba(15,22,27,0.9)] transition-all duration-[1500ms] ease-[cubic-bezier(0.86,0,0.07,1)] z-[-1] left-0 top-0">
            </div>
            <div className=" absolute text-4xl text-myGreen cursor-pointer right-[5%] top-[5%]">
                <GiCrossedSwords onClick={handleSearch} />
            </div>
            <div className="w-full flex  flex-col justify-center items-center">

                <div className="flex flex-wrap w-full">
                    <div className="w-full flex flex-col justify-center items-center basis-full relative px-[15px]">
                        <Text as={`h2`}
                            className="title text-[47px] font-extrabold uppercase text-mgGreen tracking-[-1px] mt-0 mb-[70px] mx-0 font-barlow">
                            ...
                            <Text as={`span`}
                                className=" text-[#fff] tracking-[5px] drop-shadow-[-2px_2.5px_0px_rgba(69,248,130,0.66)]">Search Here</Text> ...
                        </Text>

                        <form className="relative w-full z-50">
                            <div className={`w-full relative before:absolute before:content-['']  before:h-[1px] before:bg-myGreen before:transition-all before:duration-[1500ms] before:ease-[cubic-bezier(0.86,0,0.07,1)] before:delay-300 before:left-0 before:bottom-0 ${openSearch ? "before:w-full" : "before:w-0"}`}>
                                <input ref={search} type="text" name="search" placeholder="Type keywords here" required className={`block w-full text-center  outline-none font-medium text-3xl text-[#fff] pt-2.5 pb-5 px-[50px] border-b border-transparent bg-transparent placeholder:text-3xl placeholder:opacity-50 `} />
                            </div>
                            <Button type="submit"
                                className="absolute text-[30px] text-myGreen border-0 right-5 top-[30%] bg-transparent">
                                <FiSearch />
                            </Button>
                        </form>

                    </div>
                </div>

            </div>
        </div>
    )
}