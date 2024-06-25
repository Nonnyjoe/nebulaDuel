import breadcrumb from "../../assets/img/breadcrumb_img03.png";
import { ImageWrap } from "../atom/ImageWrap";
import { FaTrophy, FaPlayCircle, FaClock } from "react-icons/fa";
import "animate.css/animate.min.css";

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
                        <a
                          className="hover:text-[#ffbe18] text-green-400"
                          href="index.html"
                        >
                          Home
                        </a>
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
                <div className="section__title text-left title-shape-none md:text-center sm:text-center xsm:text-center">
                  <span className="sub-title tg__animate-text block uppercase text-[14px] tracking-[2px] font-semibold text-[#45f882] leading-none mt-0 mb-[7px] mx-0 sm:m-[0_0_10px] xsm:m-[0_0_10px]">
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
                  {/* <div
                    className=" relative z-[1] mt-0 mb-[25px] mx-0 last:m-0 before:content-[''] before:absolute before:w-[200px] before:h-[60px] before:transition-all before:duration-[0.3s] before:ease-[ease-out] before:delay-[0s] before:z-[-1] before:left-[13%] before:top-[19px] group before:bg-[#45f882] hover:before:bg-[#ffbe18] md:border md:m-0 md:p-[30px] md:rounded-[10px] md:border-solid md:border-[#212d38] md:before:hidden md:bg-[#19222b] sm:border sm:m-0 sm:p-[30px] sm:rounded-[10px] sm:border-solid sm:border-[#212d38] sm:before:hidden sm:bg-[#19222b] xsm:border xsm:m-0 xsm:p-[30px] xsm:rounded-[10px] xsm:border-solid xsm:border-[#212d38] xsm:before:hidden xsm:bg-[#19222b] fadeInUp"
                    data-wow-delay=".2s"
                  >
                    <div className=" absolute -translate-y-2/4 flex items-center left-[60px] right-[50px] top-2/4 lg:left-[50px] lg:right-[45px] md:relative md:translate-y-0 md:flex-wrap md:gap-[40px_0] md:top-0 md:inset-x-0 sm:relative sm:translate-y-0 sm:flex-wrap sm:gap-[40px_0] sm:top-0 sm:inset-x-0 xsm:relative xsm:translate-y-0 xsm:flex-wrap xsm:gap-[40px_0] xsm:top-0 xsm:inset-x-0">
                      <div className="tournament__list-thumb w-[150px] flex-[0_0_auto] lg:w-[115px] md:w-6/12 sm:w-6/12 xsm:w-6/12">
                        <a href="tournament-details.html">
                          <img
                            className="max-w-[89px] max-h-[91px] lg:max-w-[80px] lg:max-h-[75px] md:max-w-[80px] md:max-h-[75px] sm:max-w-[80px] sm:max-h-[75px] xsm:max-w-[80px] xsm:max-h-[75px]"
                            src="assets/img/others/tournament_thumb01.png"
                            alt="thumb"
                          />
                        </a>
                      </div>
                      <div className="w-[205px] flex-[0_0_auto] relative z-[1] pl-[35px] before:content-[''] before:absolute before:-translate-y-2/4 before:h-[53px] before:w-px before:opacity-[0.18] before:z-[1] before:left-px before:top-2/4 before:bg-[radial-gradient(circle,_var(--tw-gradient-stops))] before:from-[#fff_0%] before:via-[transparent_100%] before:to-[#10181f_100%] after:content-[''] after:absolute after:-translate-y-2/4 after:h-[60px] after:w-[3px] after:left-0 after:top-2/4 after:bg-[#121920] md:w-6/12 md:flex-[0_0_auto] md:text-right md:pl-5 sm:w-6/12 sm:flex-[0_0_auto] sm:text-right sm:pl-5 xsm:w-6/12 xsm:flex-[0_0_auto] xsm:text-right xsm:pl-5">
                        <h5 className="team-name text-[18px] mt-0 mb-2 mx-0">
                          FoxTie Max
                        </h5>
                        <span className="status block uppercase text-[13px] font-bold tracking-[1px] text-[#45f882] relative leading-none transition-all duration-[0.3s] ease-[ease-out] delay-[0s] pl-[13px] before:content-[''] before:absolute before:w-2 before:h-2 before:rounded-[50%] before:left-0 before:top-[3px] font-Barlow before:bg-[#45f882] group-hover:text-[#ffbe18] md:pl-0 md:pr-[13px] md:before:left-auto md:before:right-0 sm:pl-0 sm:pr-[13px] sm:before:left-auto sm:before:right-0 xsm:pl-0 xsm:pr-[13px] xsm:before:left-auto xsm:before:right-0">
                          Online
                        </span>
                      </div>
                      <div className="tournament__list-prize w-[216px] flex-[0_0_auto] relative pl-[55px] before:content-[''] before:absolute before:-translate-y-2/4 before:h-[53px] before:w-px before:opacity-[0.18] before:z-[1] before:left-px before:top-2/4 before:bg-[radial-gradient(circle,_var(--tw-gradient-stops))] before:from-[#fff_0%] before:via-[transparent_100%] lg:w-[180px] lg:pl-10 md:w-6/12 md:pl-0 md:pr-5 md:py-0 md:before:hidden sm:w-6/12 sm:pl-0 sm:pr-5 sm:py-0 sm:before:hidden xsm:w-6/12 xsm:pl-0 xsm:pr-5 xsm:py-0 xsm:before:hidden">
                        <h6 className="title text-[15px] text-[#adb0bc] tracking-[1px] mt-0 mb-[3px] mx-0">
                          Prize
                        </h6>
                        <FaTrophy className="text-[#45f882] text-[14px] transition-all duration-[0.3s] ease-[ease-out] delay-[0s] mr-[7px]" />
                        <span className="text-[#45f882] text-[17px] font-semibold tracking-[1px] transition-all duration-[0.3s] ease-[ease-out] delay-[0s] font-Barlow group-hover:text-[#ffbe18]">
                          $75000
                        </span>
                      </div>
                      <div className="tournament__list-time w-[216px] flex-[0_0_auto] relative pl-[55px] before:content-[''] before:absolute before:-translate-y-2/4 before:h-[53px] before:w-px before:opacity-[0.18] before:z-[1] before:left-px before:top-2/4 before:bg-[radial-gradient(circle,_var(--tw-gradient-stops))] before:from-[#fff_0%] before:via-[transparent_100%] md:w-6/12 md:text-right md:pl-5 sm:w-6/12 sm:text-right sm:pl-5 xsm:w-6/12 xsm:text-right xsm:pl-5 lg:w-[180px] lg:pl-10">
                        <h6 className="title text-[15px] text-[#adb0bc] tracking-[1px] mt-0 mb-[3px] mx-0">
                          Time
                        </h6>
                        <FaClock className="text-[14px] mr-[7px]" />
                        <span className="text-[#adb0bc] text-[17px] font-semibold uppercase tracking-[1px] font-Barlow">
                          10h : 15m
                        </span>
                      </div>
                      <div className="tournament__list-live ml-auto flex-[0_0_auto] md:mx-auto md:my-0 sm:mx-auto sm:my-0 xsm:mx-auto xsm:my-0">
                        <a
                          className="group-hover:text-[#fff] inline-block uppercase font-bold text-[13px] text-[#adb0bc] tracking-[1px] px-[45px] py-3 rounded-md font-Barlow bg-[#0c1217] lg:px-[22px] lg:py-3"
                          href="https://www.twitch.tv/videos/1726788358"
                          target="_blank"
                        >
                          Live now{" "}
                          <FaPlayCircle className="group-hover:text-[#ffbe18] transition-all duration-[0.3s] ease-[ease-out] delay-[0s] ml-[3px]" />
                        </a>
                      </div>
                    </div>
                  </div> */}
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
