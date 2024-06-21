import React, { useState } from 'react';
import './Modal.css'; // Include your modal CSS file for styling
import { useNavigate } from "react-router-dom";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const DuelCreatedModal: React.FC<ModalProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  // const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
  //   setInputValue(event.target.value);
  // };

  const handleCreateDuel = async (e: any) => {
    e.preventDefault();
      // If wallet is connected, navigate to the arena page
      navigate("/SelectWarriors");
  };


  const handleJoinDuel = async (e: any) => {
    e.preventDefault();
      // If wallet is connected, navigate to the arena page
    navigate("/duels");
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="modal-overlay">
      <div className="duel_modal">
        <button className="close-button" onClick={onClose}>X</button>
        <div className='loading_div'>
            <img src="./assets/img/Loading.png" alt="Loading Images..." className="loading_img" />
        </div>
        <h2 className='popUp_Title'>Duel created waiting for player to join</h2>
      </div>
    </div>
  );
};

export default DuelCreatedModal;