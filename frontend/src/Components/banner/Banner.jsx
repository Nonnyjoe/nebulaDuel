import React from "react";
import "./Banner.css";
import { checkStatus } from "../header/Header";
import { useState } from "react";
import { Network } from "../../Network";
import { useNavigate } from "react-router-dom";

const Banner = () => {
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const navigate = useNavigate();


  const handlePlayNow = (e) => {
    console.log("clicked ")
    e.preventDefault();
    if (!checkStatus) {
      //connectWa(llet();
      console.log("not connected")
    } else {
      navigate("/arena");
    }
  };

  return (
    <>
      <section className="mainBanner">
        <div className="container flex alignCenter">
          <div className="content">
            <h3>LIVE GAMING</h3>
            <h1 className="textGreenShadow">POKEMONING</h1>
            <h3>VIDEO GAMES ONLINE</h3>
            <a className="glButtonFill" onClick={handlePlayNow}>
              <span className="flex alignCenter ">PLAY NOW</span>
            </a>
          </div>
          <div className="image">
           <img src="assets/img/slider_img01.png" alt="" />
          </div>
        </div>
      </section>
    </>
  );
};

export default Banner;
