import React, { useState } from "react";
import "./Banner.css";
import { useNavigate } from "react-router-dom";
import { Network } from "../../Network";
import { checkStatus } from "../header/Header";

const Banner = () => {
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const navigate = useNavigate();

  const handleConnectWallet = () => {
    setIsWalletConnected(true);
  };

  const handlePlayNow = async (e) => {
    e.preventDefault();

    // Check if the wallet is connected
    if (isWalletConnected === false) {
      // If not connected, prompt user to connect wallet
      await handleConnectWallet();
    } else {
      // If wallet is connected, navigate to the arena page
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
            <span className="glButtonFill" onClick={handlePlayNow}>
              <span className="flex alignCenter">PLAY NOW</span>
            </span>
          </div>
          <div className="image">
            <img src="assets/img/slider_img01.png" alt="" />
          </div>
        </div>

              {/* Render the wallet connection component */}
      <Network
        onConnectWallet={() => {
          // Set the wallet connected state to true
          setIsWalletConnected(true);
        }}
      />
      </section>


    </>
  );
};

export default Banner;