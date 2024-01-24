import React from 'react'

const scrollButton = () => {
  return (
    <div>
        <button class="scroll__top scroll-to-target w-[45px] h-[45px] leading-[45px] fixed bottom-[-10%] text-xl z-[99] text-[#201f2a] text-center cursor-pointer transition-[0.8s] duration-500 rounded-[3px] border-[none] right-[50px] bg-[#45f882] after:absolute after:z-[-1] after:content-[''] after:h-2.5 after:w-[90%] after:opacity-100 after:left-[5%] after:top-full after:bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0.25)0%,rgba(0,0,0,0)80%)]  hover:text-[#201f2a] hover:bg-[#ffbe18]    
     lg:w-10 lg:h-10 lg:leading-10 lg:text-center lg:right-[30px] lg:text-[18px]
     md:w-[35px] md:h-[35px] md:leading-[35px] md:text-center md:right-[25px] md:text-[18px]
     sm:w-[30px] sm:h-[30px] sm:leading-[30px] sm:text-center sm:text-[16px] sm:right-[15px]
     xsm:w-[30px] xsm:h-[30px] xsm:leading-[30px] xsm:text-center xsm:text-[16px] xsm:right-[15px]
    " data-target="html">
        <i class="flaticon-right-arrow -rotate-90"></i>
    </button>

    </div>
  )
}

export default scrollButton