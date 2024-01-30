import React, { useState } from "react";
import "./Banner.css";
import { useNavigate } from "react-router-dom";
import { Network } from "../../Network";
import { checkStatus } from "../header/Header";
import Modal from './Modal';
// import './Modal.css'; // Include your modal CSS file for styling

const Banner = () => {
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = async() => {
    if (isWalletConnected === false) {
      // If not connected, prompt user to connect wallet
      await handleConnectWallet();
    } else {
      // If wallet is connected, open the modal
      setIsModalOpen(true);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleConnectWallet = () => {
    setIsWalletConnected(true);
  };


  const handleCreateDuel = async (e: any) => {
    e.preventDefault();

    // Check if the wallet is connected

  };


  return (
    <>
      <section className="mainBanner">
        <div className="container flex alignCenter">
          <div className="content">
            <h3 className="live">LIVE GAMING</h3>
            <h1 className="textGreenShadow">POKEMONING</h1>
            <h3>VIDEO GAMES ONLINE</h3>
            <span className="glButtonFill" onClick={handleOpenModal}>
              <span className="flex alignCenter">PLAY NOW</span>
            </span>
            <Modal isOpen={isModalOpen} onClose={handleCloseModal} />
          </div>
          <div className="image">
            <img src="assets/img/Dragon.png" alt="" />
          </div>
        </div>
      </section>


    </>
  );
};

export default Banner;
// export default Modal;