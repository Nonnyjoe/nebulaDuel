import React, { useState } from 'react';
import './Modal.css'; // Include your modal CSS file for styling
import { useNavigate } from "react-router-dom";
import { useRollups } from '../../../useRollups';
import { Input } from '../../../utils/input';


interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  duelId: Number;
}



const Modal: React.FC<ModalProps> = ({ isOpen, onClose, duelId }) => {
  const navigate = useNavigate();
  // const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
  //   setInputValue(event.target.value);
  // };
  const [dappAddress, setDappAddress] = useState(
    "0x70ac08179605AF2D9e75782b8DEcDD3c22aA4D0C"
    );
    const rollups = useRollups(dappAddress);

    const functionParamsAsString = JSON.stringify({
      method: "fight",
      duelId: duelId,
    });

  const handleCreateDuel = async (e: any) => {
    e.preventDefault();
      // If wallet is connected, navigate to the arena page
      if (rollups === undefined) {
        alert ("Problem encountered creating profile, please reload your page and reconnect wallet");
      }
      // navigate("/SelectWarriors");
    Input(rollups, dappAddress, functionParamsAsString, false);

    setTimeout(() => {
      onClose();
    }, 5000);
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
        <h2 className='popUp_Title'>CLICK THE BUTTON BELOW TO START DUEL</h2>
          <div className='duel-type'> 
            <button type="button" className='duelButton' onClick={handleCreateDuel}>Start Duel</button>
            {/* <button type="button" className='duelButton' onClick={handleJoinDuel}>Join Duel</button> */}
          </div>
      </div>
    </div>
  );
};

export default Modal;