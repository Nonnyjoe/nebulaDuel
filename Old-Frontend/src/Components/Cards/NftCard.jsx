import React from "react";
import { BsSuitHeart } from "react-icons/bs";
import { FaEthereum, FaArrowRight } from "react-icons/fa";

const NftCard = ({ profile, img }) => {
  return (
    <>
      <div className="nftCard">
        <div className="mainCard">
          <div className="profile flex justifySpaceBet alignCenter">
            <div className="avatar flex alignCenter">
              <img src={profile} alt="" />
              <div className="content">
                <h5>Luck Crypto</h5>
                <a href="/">
                  <small>@Jon_Max</small>
                </a>
              </div>
            </div>
            <div className="cart">
              <BsSuitHeart />
            </div>
          </div>

          <div className="image">
            <img src={img} alt="" />
          </div>

          <div className="footContent flex justifySpaceBet alignCenter">
            <div className="lastprice">
              <p>Last Bid</p>
              <h4 className="flex alignCenter">
                <FaEthereum /> 1.004 <span>ETH</span>
              </h4>
            </div>
            <button className="yellowButton flex alignCenter">
              Bid <FaArrowRight />
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default NftCard;
