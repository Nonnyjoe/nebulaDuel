import { Link } from "react-router-dom";
import breadcrumb from "../../assets/img/breadcrumb_img03.png";
import { ImageWrap } from "../atom/ImageWrap";

import "animate.css/animate.min.css";
import DuelCard from "./DuelCard";

const JoinDuels = () => {
  return (
    <div className="main--area overflow-x-hidden">
      {/* Breadcrumb Area */}
      <section className="breadcrumb-area relative bg-center bg-cover min-h-[561px] flex items-center pt-[110px] pb-[75px] px-0 before:content-[''] before:absolute before:w-6/12 before:bg-[#45f882] before:h-[50px] before:left-0 before:bottom-0 after:content-[''] after:absolute after:w-6/12 after:bg-[#45f882] after:h-[50px] after:left-auto after:right-0 after:bottom-0 before:clip-path-polygon-[0_0,0_100%,100%_100%] after:clip-path-polygon-[100%_0,0_100%,100%_100%]">
        <div className="container">
          <div className="breadcrumb__wrapper relative px-20 py-0 lg:px-0 md:px-0 sm:px-0 xsm:px-0">
            <div className="flex flex-wrap mx-[-15px]">
              <div className="w-6/12 basis-6/12 xl:w-6/12 xl:basis-6/12 lg:w-7/12 lg:basis-7/12 md:w-full md:basis-full sm:w-full sm:basis-full xsm:w-full xsm:basis-full relative px-[15px]">
                <div className="breadcrumb__content text-left md:text-center sm:text-center xsm:text-center">
                  <h2 className="title text-[60px] font-extrabold tracking-[3px] leading-none m-0 xl:text-[50px] xl:tracking-[2px] lg:text-[50px] lg:tracking-[2px] md:text-[50px] md:tracking-[2px] sm:text-[43px] sm:tracking-[2px] xsm:text-[43px] xsm:tracking-[2px]">
                    Tournament
                  </h2>
                  <nav aria-label="breadcrumb">
                    <ol className="breadcrumb justify-start sm:justify-center xsm:justify-center mt-3 mb-0 mx-0 flex flex-wrap list-none md:justify-center sm:text-center xsm:text-center">
                      <li className="breadcrumb-item uppercase font-bold text-[14px] tracking-[2px] flex items-center after:content-[''] after:block after:w-2 after:h-2 after:transition-all after:duration-[0.3s] after:ease-[ease-out] after:mx-2.5 after:rounded-full after:bg-[#45f882] hover:after:bg-[#ffbe18]">
                        <Link
                          to={`/`}
                          className="hover:text-[#ffbe18] text-green-400"
                        >
                          Home
                        </Link>
                      </li>
                      <li
                        className="breadcrumb-item uppercase font-bold text-[14px] tracking-[2px] flex items-center after:content-[''] after:block after:w-2 after:h-2 after:transition-all after:duration-[0.3s] after:ease-[ease-out] after:mx-2.5 after:rounded-full after:bg-[#45f882] hover:after:bg-[#ffbe18] active text-[#fff]"
                        aria-current="page"
                      >
                        Tournament
                      </li>
                    </ol>
                  </nav>
                </div>
              </div>
              <div className="w-6/12 basis-6/12 xl:w-6/12 xl:basis-6/12 lg:w-5/12 lg:basis-5/12 md:w-full md:basis-full sm:w-full sm:basis-full xsm:w-full xsm:basis-full relative px-[15px] block md:hidden sm:hidden xsm:hidden">
                <div className="breadcrumb__img absolute -translate-y-2/4 right-[30px] top-2/4 group xl:right-[60px] xl:top-[60%] lg:right-[60px] lg:top-[60%]">
                  <img
                    className="max-h-[412px] max-w-[402px] group-hover:animate-[breadcrumbShake_0.82s_cubic-bezier(0.36,0.07,0.19,0.97)_both] lg:max-h-[260px] lg:max-w-[255px] xl:max-h-80 xl:max-w-[310px]"
                    src="assets/img/others/breadcrumb_img03.png"
                    alt="img"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <aside className="flex flex-col justify-end items-center">
          <ImageWrap
            image={breadcrumb}
            className="w-[100%] md:w-[80%] lg:w-[75%] xxl:w-[60%] 2xl:w-[60%]"
            alt="Game-Avatar"
          />
        </aside>
      </section>

      {/* See Duel List */}

      <section className="breadcrumb-area-02 w-full pb-[120px] pt-[120px] bg-center bg-cover ">
        <div className="container">
          <div className="tournament__wrapper px-20 py-0 xl:px-[60px] xl:py-0 lg:p-0 md:p-0 sm:p-0 xsm:p-0">
            <div className="flex flex-wrap mx-[-15px] items-end mb-[60px]">
              <div className="w-8/12 basis-8/12 xl:w-8/12 xl:basis-8/12 lg:w-8/12 lg:basis-8/12 md:w-full md:basis-full sm:w-full sm:basis-full xsm:w-full xsm:basis-full relative px-[15px]">
                <div className=" text-left  md:text-center sm:text-center xsm:text-center">
                  <span className=" tg__animate-text block uppercase text-[14px] tracking-[2px] font-semibold text-[#45f882] leading-none mt-0 mb-[7px] mx-0 sm:m-[0_0_10px] xsm:m-[0_0_10px]">
                    Tournament List
                  </span>
                  <h3 className="title text-[45px] font-extrabold tracking-[1px] m-0 sm:text-[35px] xsm:text-[35px]">
                    Active Tournament
                  </h3>
                </div>
              </div>
              <div className="w-4/12 basis-4/12 xl:w-4/12 xl:basis-4/12 lg:w-4/12 lg:basis-4/12 md:w-full md:basis-full sm:w-full sm:basis-full xsm:w-full xsm:basis-full relative px-[15px]">
                <div className="section__title-link text-right md:text-center md:m-[10px_0_0] sm:text-center sm:m-[10px_0_0] xsm:text-center xsm:m-[10px_0_0]">
                  <a
                    className="inline-block font-semibold text-[#adb0bc] relative pt-0 pb-[3px] px-0 hover:text-[#45f882] after:content-[''] after:absolute after:w-full after:h-px after:right-0 after:bottom-0 font-Barlow after:bg-[#45f882]"
                    href="tournament.html"
                  >
                    EXPLORE MORE
                  </a>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap mx-[-15px]">
              <div className="w-full basis-full relative px-[15px]">
                <div className=" md:grid md:grid-cols-[repeat(2,1fr)] md:gap-[30px] sm:grid sm:grid-cols-[repeat(1,1fr)] sm:gap-[30px] sm:max-w-[75%] sm:mx-auto sm:my-0 xsm:grid xsm:grid-cols-[repeat(1,1fr)] xsm:gap-[30px]">
                  {/*start component*/}

                  <Link to={`/arena`}>
                    <DuelCard />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default JoinDuels;
