import React from "react";
import "./card.css";
import { FaArrowRight } from 'react-icons/fa';

const BidCard = ({ image, title, creatorName, price }) => {
  return (
    <>
      <div className="bidCard flex alignCenter">
        <div className="image">
          <img src={image} alt="Bid NFT Images" />
        </div>
        <div className="content">
          <h3>{title}</h3>
          <div className="creator flex alignCenter">
            <img src="assets/img/nft_avatar.png" alt="" />
            <p>{creatorName}</p> <p>|</p>
            <p>CREATOR</p>
          </div>
          <div className="createBid flex justifySpaceBet alignCenter">
            <h5>{price} <span>ETH</span></h5>
            <button className="yellowButton flex alignCenter"> Buy <FaArrowRight /></button>
          </div>
        </div>
      </div>
    </>
  );
};

export default BidCard;
