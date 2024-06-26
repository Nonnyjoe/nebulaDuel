import { FaTrophy } from "react-icons/fa";

const DuelCard = () => {
  return (
    <div
      className=" relative w-max z-[1] mt-0 mb-[25px] mx-0 last:m-0 before:content-[''] before:absolute before:w-[200px] before:h-[60px] before:transition-all before:duration-[0.3s] before:ease-[ease-out] before:delay-[0s] before:z-[-1] before:left-[13%] before:top-[19px] group before:bg-[#45f882] hover:before:bg-[#ffbe18] md:border md:m-0 md:p-[30px] md:rounded-[10px] md:border-solid md:border-[#212d38] md:before:hidden md:bg-[#19222b] sm:border sm:m-0 sm:p-[30px] sm:rounded-[10px] sm:border-solid sm:border-[#212d38] sm:before:hidden sm:bg-[#19222b] xsm:border xsm:m-0 xsm:p-[30px] xsm:rounded-[10px] xsm:border-solid xsm:border-[#212d38] xsm:before:hidden xsm:bg-[#19222b] fadeInUp"
      data-wow-delay=".2s"
    >
      <div className=" absolute -translate-y-2/4 flex items-center left-[60px] right-[50px] top-2/4 lg:left-[50px] lg:right-[45px] md:relative md:translate-y-0 md:flex-wrap md:gap-[40px_0] md:top-0 md:inset-x-0 sm:relative sm:translate-y-0 sm:flex-wrap sm:gap-[40px_0] sm:top-0 sm:inset-x-0 xsm:relative xsm:translate-y-0 xsm:flex-wrap xsm:gap-[40px_0] xsm:top-0 xsm:inset-x-0">
        <div className=" w-[150px] flex-[0_0_auto] lg:w-[115px] md:w-6/12 sm:w-6/12 xsm:w-6/12">
          <img
            className="max-w-[89px] max-h-[91px] rounded-full lg:max-w-[80px] lg:max-h-[75px] md:max-w-[80px] md:max-h-[75px] sm:max-w-[80px] sm:max-h-[75px] xsm:max-w-[80px] xsm:max-h-[75px]"
            src={
              "https://openseauserdata.com/files/77cb5444c80e8d4e5dc1d4654c8d7d43.png"
            }
            alt="thumb"
          />
        </div>
        <div className="w-[205px] flex-[0_0_auto] relative z-[1] pl-[35px] before:content-[''] before:absolute before:-translate-y-2/4 before:h-[53px] before:w-px before:opacity-[0.18] before:z-[1] before:left-px before:top-2/4 before:bg-[radial-gradient(circle,_var(--tw-gradient-stops))] before:from-[#fff_0%] before:via-[transparent_100%] before:to-[#10181f_100%] after:content-[''] after:absolute after:-translate-y-2/4 after:h-[60px] after:w-[3px] after:left-0 after:top-2/4  md:w-6/12 md:flex-[0_0_auto] md:text-right md:pl-5 sm:w-6/12 sm:flex-[0_0_auto] sm:text-right sm:pl-5 xsm:w-6/12 xsm:flex-[0_0_auto] xsm:text-right xsm:pl-5">
          <h4 className=" text-[15px] text-[#adb0bc] tracking-[1px] mt-0 mb-[3px] mx-0">
            Duel ID
          </h4>
          <p>234</p>
          <span className="status block uppercase text-[13px] font-bold tracking-[1px] text-[#45f882] relative leading-none transition-all duration-[0.3s] ease-[ease-out] delay-[0s] pl-[13px] before:content-[''] before:absolute before:w-2 before:h-2 before:rounded-[50%] before:left-0 before:top-[3px] font-Barlow before:bg-[#45f882] group-hover:text-[#ffbe18] md:pl-0 md:pr-[13px] md:before:left-auto md:before:right-0 sm:pl-0 sm:pr-[13px] sm:before:left-auto sm:before:right-0 xsm:pl-0 xsm:pr-[13px] xsm:before:left-auto xsm:before:right-0">
            Online
          </span>
        </div>
        <div className=" w-[216px] flex-[0_0_auto] relative pl-[55px] before:content-[''] before:absolute before:-translate-y-2/4 before:h-[53px] before:w-px before:opacity-[0.18] before:z-[1] before:left-px before:top-2/4 before:bg-[radial-gradient(circle,_var(--tw-gradient-stops))] before:from-[#fff_0%] before:via-[transparent_100%] lg:w-[180px] lg:pl-10 md:w-6/12 md:pl-0 md:pr-5 md:py-0 md:before:hidden sm:w-6/12 sm:pl-0 sm:pr-5 sm:py-0 sm:before:hidden xsm:w-6/12 xsm:pl-0 xsm:pr-5 xsm:py-0 xsm:before:hidden">
          <h4 className=" text-[15px] text-[#adb0bc] tracking-[1px] mt-0 mb-[3px] mx-0">
            Stake
          </h4>
          <FaTrophy className="text-[#45f882] text-[14px] transition-all duration-[0.3s] ease-[ease-out] delay-[0s] mr-[7px]" />
          <span className="text-[#45f882] text-[17px] font-semibold tracking-[1px] transition-all duration-[0.3s] ease-[ease-out] delay-[0s] font-Barlow group-hover:text-[#ffbe18]">
            75
          </span>
        </div>
        <div className=" w-[216px] flex-[0_0_auto] relative pl-[55px] before:content-[''] before:absolute before:-translate-y-2/4 before:h-[53px] before:w-px before:opacity-[0.18] before:z-[1] before:left-px before:top-2/4 before:bg-[radial-gradient(circle,_var(--tw-gradient-stops))] before:from-[#fff_0%] before:via-[transparent_100%] md:w-6/12 md:text-right md:pl-5 sm:w-6/12 sm:text-right sm:pl-5 xsm:w-6/12 xsm:text-right xsm:pl-5 lg:w-[180px] lg:pl-10">
          <h6 className="title text-[15px] text-[#adb0bc] tracking-[1px] mt-0 mb-[3px] mx-0">
            Creator
          </h6>

          <span>FoxTie Max</span>
        </div>
      </div>
    </div>
  );
};

export default DuelCard;
