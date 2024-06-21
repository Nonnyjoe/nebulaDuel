import React, { useState } from 'react';
import './Modal.css'; // Include your modal CSS file for styling
import { useNavigate } from "react-router-dom";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose }) => {
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
      <div className="modal">
        <button className="close-button" onClick={onClose}>X</button>
        <h2 className='popUp_Title'>SELECT GAME OPTION</h2>
          <div className='duel-type'> 
            <button type="button" className='duelButton' onClick={handleCreateDuel}>Create Duel</button>
            <button type="button" className='duelButton' onClick={handleJoinDuel}>Join Duel</button>
          </div>
      </div>
    </div>
  );
};

export default Modal;