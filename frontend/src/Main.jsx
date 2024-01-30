import React from 'react'
import Header from './Components/header/Header'
import Banner from './Components/banner/Banner'
import GameBid from './Components/gameBid/GameBid'
import ScrollButton from './Components/ScrollButton'
import Footer from './Components/footer/Footer'
import KnowAboutUs from './Components/knowAbout/KnowAboutUs'
import ActiveDuels from './Duels/ActiveDuels'


const Main = () => {
  return (
    <div>
      <Header />
      <Banner />
      <GameBid />
      <ActiveDuels />
      <KnowAboutUs />
      <Footer />
    </div>
  )
}

export default Main