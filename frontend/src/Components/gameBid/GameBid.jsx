import React from 'react';
import BidCard from '../Cards/BidCard';
import "./gameBid.css";

const GameBid = () => {
  return (
    <>
        <section className="gameBid commonSection">
            <div className="container flex justifyCenter flexWrap">
                <BidCard price={"1.002"} creatorName={"0xblackadam"} title={"POKEMON DRAGON"} image={"assets/img/Godzilla.png"} />
                <BidCard price={"1.002"} creatorName={"Nonnyjoe"} title={"POKEMON PRINCESS"} image={"assets/img/Hound.png"} />
                <BidCard price={"1.002"} creatorName={"Evans"} title={"POKEMON FIREFLY "} image={"assets/img/komodo.png"} />
            </div>
        </section>
    </>
  )
}

export default GameBid