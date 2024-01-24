import React from 'react';
import BidCard from '../Cards/BidCard';
import "./gameBid.css";

const GameBid = () => {
  return (
    <>
        <section className="gameBid commonSection">
            <div className="container flex justifyCenter flexWrap">
                <BidCard price={"1.002"} creatorName={"0xblackadam"} title={"POKEMON DRAGON"} image={"assets/img/bidimg_1.jpg"} />
                <BidCard price={"1.002"} creatorName={"Nonnyjoe"} title={"POKEMON PRINCESS"} image={"assets/img/bidimg_2.jpg"} />
                <BidCard price={"1.002"} creatorName={"Evans"} title={"POKEMON FIREFLY "} image={"assets/img/bidimg_3.jpg"} />
            </div>
        </section>
    </>
  )
}

export default GameBid