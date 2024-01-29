import React from 'react';
import data from './data'
import Swipercore from "swiper"
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import { Pagination , Navigation, Autoplay } from 'swiper/modules';
import { Link } from "react-router-dom"

Swipercore.use([Autoplay, Navigation])

const Cards = () => {
  const breakpoints = {
    320: {
      slidesPerView: 1,
      spaceBetween: 10,
    },
    820: {
      slidesPerView: 3,
      spaceBetween: 20,
    },
    1024: {
      slidesPerView: 4,
      spaceBetween: 30,
    },
  };

  return (
    <div className='card-container'>   
        <p>All Your Characters</p>
        <br />
        <br />
        <Swiper
        slidesPerView={4}
        spaceBetween={30}
        pagination={{
          clickable: true,
        }}
        modules={[Pagination]}
        breakpoints={breakpoints}
        className="mySwiper">
          {data.map(info => (
            <SwiperSlide key={info.id}>
            <Link key={info.id} to={`/${info.id}`} className='linkStyle'>
            <div style={{ backgroundImage: `url(${info.img})` }} className='card'>
              <div className='overlay'></div>
            <h3 className='name'>{info.name}</h3>
            </div>
        </Link>
        </SwiperSlide>
          ))}
          <br />
          <br />
          <br />
          <br />
            </Swiper> 
    </div>
  )
}

export default Cards;